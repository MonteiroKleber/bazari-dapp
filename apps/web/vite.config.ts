// apps/web/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait(),
    nodePolyfills({
      include: ['buffer', 'crypto', 'util', 'stream'],
      globals: {
        Buffer: true,
        global: true,
        process: true
      }
    })
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
      '@locales': path.resolve(__dirname, './src/locales'),
      // Fix para bn.js
      'bn.js': path.resolve(__dirname, '../../node_modules/bn.js/lib/bn.js')
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
      'bn.js',
      '@polkadot/util',
      '@polkadot/util-crypto',
      '@polkadot/keyring',
      '@polkadot/wasm-crypto',
      '@polkadot/wasm-crypto-asmjs',
      '@polkadot/wasm-crypto-init',
      '@polkadot/wasm-crypto-wasm',
      '@polkadot/wasm-util',
      '@polkadot/x-bigint',
      '@polkadot/x-global',
      '@polkadot/x-randomvalues',
      '@polkadot/x-textdecoder',
      '@polkadot/x-textencoder',
      '@noble/hashes',
      '@noble/curves',
      '@scure/base'
    ],
    esbuildOptions: {
      target: 'esnext',
      define: {
        global: 'globalThis'
      }
    }
  },
  build: {
    target: 'esnext',
    modulePreload: {
      polyfill: true
    },
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/]
    },
    rollupOptions: {
      external: []
    }
  },
  define: {
    'process.env': {},
    global: 'globalThis'
  }
})