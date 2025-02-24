export interface EncryptionResult {
  ciphertext: string;
  iv: string;
  key?: string;
}

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export interface DecryptionResult {
  plaintext: string;
}