// apps/api/src/plugins/ipfs.ts
import fp from 'fastify-plugin'

// Dynamic import for ESM module
async function loadIPFS() {
  const { create } = await import('ipfs-http-client')
  return { create }
}

declare module 'fastify' {
  interface FastifyInstance {
    ipfs: {
      client: any
      addFile: (content: Buffer | Uint8Array | string) => Promise<string>
      addJSON: (data: any) => Promise<string>
      getFile: (cid: string) => Promise<Uint8Array>
      getJSON: (cid: string) => Promise<any>
      pin: (cid: string) => Promise<void>
      unpin: (cid: string) => Promise<void>
      version: () => Promise<any>
    }
  }
}

export default fp(async (server) => {
  const { create } = await loadIPFS()
  
  const client = create({
    url: process.env.IPFS_API_URL || 'http://localhost:5001',
  })

  const ipfsHelper = {
    client,

    async addFile(content: Buffer | Uint8Array | string): Promise<string> {
      try {
        const result = await client.add(content)
        return result.cid.toString()
      } catch (error) {
        server.log.error('IPFS add error:', error)
        throw error
      }
    },

    async addJSON(data: any): Promise<string> {
      try {
        const json = JSON.stringify(data)
        const result = await client.add(json)
        return result.cid.toString()
      } catch (error) {
        server.log.error('IPFS add JSON error:', error)
        throw error
      }
    },

    async getFile(cid: string): Promise<Uint8Array> {
      try {
        const chunks: Uint8Array[] = []
        for await (const chunk of client.cat(cid)) {
          chunks.push(chunk)
        }
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
        const result = new Uint8Array(totalLength)
        let offset = 0
        for (const chunk of chunks) {
          result.set(chunk, offset)
          offset += chunk.length
        }
        return result
      } catch (error) {
        server.log.error('IPFS get error:', error)
        throw error
      }
    },

    async getJSON(cid: string): Promise<any> {
      try {
        const data = await this.getFile(cid)
        const text = new TextDecoder().decode(data)
        return JSON.parse(text)
      } catch (error) {
        server.log.error('IPFS get JSON error:', error)
        throw error
      }
    },

    async pin(cid: string): Promise<void> {
      try {
        await client.pin.add(cid)
      } catch (error) {
        server.log.error('IPFS pin error:', error)
        throw error
      }
    },

    async unpin(cid: string): Promise<void> {
      try {
        await client.pin.rm(cid)
      } catch (error) {
        server.log.error('IPFS unpin error:', error)
        throw error
      }
    },

    async version(): Promise<any> {
      try {
        return await client.version()
      } catch (error) {
        server.log.error('IPFS version error:', error)
        throw error
      }
    },
  }

  server.decorate('ipfs', ipfsHelper)
})