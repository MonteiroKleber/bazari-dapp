import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  external: [
    '@polkadot/api',
    '@polkadot/keyring',
    '@polkadot/util',
    '@polkadot/util-crypto',
    'bip39',
    'zod',
    'qrcode',
    'idb'
  ]
})

