import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: [
    '@polkadot/api',
    '@polkadot/api-augment',
    '@polkadot/keyring',
    '@polkadot/types',
    '@polkadot/util',
    '@polkadot/util-crypto',
  ],
})