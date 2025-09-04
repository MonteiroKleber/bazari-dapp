import { blake2AsU8a } from '@polkadot/util-crypto'
import { u8aToHex, hexToU8a } from '@polkadot/util'

// Alternative to argon2 for key derivation
// Uses PBKDF2 with blake2b for browser compatibility
export async function deriveKey(
  password: string, 
  salt: Uint8Array,
  iterations: number = 100000
): Promise<Uint8Array> {
  // Convert password to Uint8Array
  const passwordBytes = new TextEncoder().encode(password)
  
  // Use Web Crypto API for PBKDF2
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBytes,
    'PBKDF2',
    false,
    ['deriveBits']
  )
  
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    256 // 32 bytes
  )
  
  return new Uint8Array(derivedBits)
}

// Alternative using blake2b for additional security
export function deriveKeyBlake2(
  password: string,
  salt: Uint8Array
): Uint8Array {
  const passwordBytes = new TextEncoder().encode(password)
  const combined = new Uint8Array(passwordBytes.length + salt.length)
  combined.set(passwordBytes)
  combined.set(salt, passwordBytes.length)
  
  // Use blake2b with 256 bits output
  return blake2AsU8a(combined, 256)
}

// Generate crypto-secure random bytes
export function randomBytes(length: number): Uint8Array {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return array
}