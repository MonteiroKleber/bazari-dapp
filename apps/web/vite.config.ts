// apps/web/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import wasm from 'vite-plugin-wasm'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    wasm()
  ],
  resolve: {
    preserveSymlinks: true,
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@store': path.resolve(__dirname, './src/store'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@locales': path.resolve(__dirname, './src/locales')
    }
  },
  server: {
    port: 5173,
    host: true,
    fs: {
      allow: ['..']
    }
  },
  optimizeDeps: {

    include: [
      // polkadot / noble (subpaths que aparecem nos erros)
      '@polkadot/util-crypto',
      '@polkadot/wasm-crypto',
      '@polkadot/wasm-crypto-asmjs',
      '@polkadot/wasm-crypto-init',
      '@noble/hashes',
      '@noble/hashes/blake2b',
      '@noble/hashes/sha256',
      '@noble/hashes/sha512'
    ],

    esbuildOptions: {
      target: 'esnext'
    },
    exclude: [
      '@polkadot/util-crypto',
      '@polkadot/keyring'
    ]
  },
  build: {
    target: 'esnext',
    modulePreload: {
      polyfill: true
    },
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
})