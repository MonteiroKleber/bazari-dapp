import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Adicionar polyfills para Node.js (necessário para Polkadot.js)
    nodePolyfills({
      // Se necessário, especifique quais polyfills usar
      include: ['buffer', 'crypto', 'stream', 'util', 'process'],
      globals: {
        Buffer: true,
        global: true,
        process: true
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@store': path.resolve(__dirname, './src/store'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@types': path.resolve(__dirname, './src/types'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@locales': path.resolve(__dirname, './src/locales'),
    }
  },
  optimizeDeps: {
    // Incluir explicitamente as dependências Polkadot
    include: [
      '@polkadot/keyring',
      '@polkadot/util',
      '@polkadot/util-crypto',
      '@polkadot/wasm-crypto',
      '@polkadot/networks'
    ],
    // Forçar ESBuild a processar esses módulos
    esbuildOptions: {
      target: 'es2020'
    }
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'polkadot': [
            '@polkadot/keyring',
            '@polkadot/util',
            '@polkadot/util-crypto'
          ]
        }
      }
    }
  },
  define: {
    // Definir variáveis globais se necessário
    'process.env': {},
    global: 'globalThis'
  },
  server: {
    port: 5173,
    host: true
  }
})