// packages/wallet-core/src/types/argon2-browser.d.ts
declare module 'argon2-browser' {
  export interface Argon2Options {
    pass: string | Uint8Array
    salt: string | Uint8Array
    time?: number
    mem?: number
    hashLen?: number
    parallelism?: number
    type?: number
  }

  export interface Argon2Result {
    hash: Uint8Array
    hashHex: string
    encoded: string
  }

  export function hash(options: Argon2Options): Promise<Argon2Result>
  export function verify(options: {
    pass: string | Uint8Array
    encoded: string
  }): Promise<boolean>

  export enum ArgonType {
    Argon2d = 0,
    Argon2i = 1,
    Argon2id = 2
  }
}