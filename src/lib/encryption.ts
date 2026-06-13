/**
 * AES-256-GCM Client-Side Encryption Engine
 * Uses Web Crypto API for hardware-accelerated encryption
 * PBKDF2 with 210,000 iterations for key derivation
 * 
 * Security Model: Zero-knowledge - server never sees plaintext or keys
 */

const SALT_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;   // 128 bits for GCM
const TAG_LENGTH = 16;  // 128 bits authentication tag
const KEY_LENGTH = 32;  // 256 bits
const PBKDF2_ITERATIONS = 210000; // OWASP recommended minimum

// Convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Generate cryptographically secure random bytes
function getRandomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

// Derive AES-256 key from master password using PBKDF2
async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  // Derive AES-256-GCM key
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false, // Non-extractable - key cannot be exported
    ['encrypt', 'decrypt']
  );

  return key;
}

// Encrypt data with AES-256-GCM
export async function encryptData(
  plaintext: string,
  masterPassword: string
): Promise<string> {
  try {
    const salt = getRandomBytes(SALT_LENGTH);
    const iv = getRandomBytes(IV_LENGTH);
    const key = await deriveKey(masterPassword, salt);

    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv, tagLength: 128 },
      key,
      data
    );

    // Combine: salt + iv + ciphertext (includes auth tag)
    const encryptedBytes = new Uint8Array(encrypted);
    const result = new Uint8Array(SALT_LENGTH + IV_LENGTH + encryptedBytes.length);

    result.set(salt, 0);
    result.set(iv, SALT_LENGTH);
    result.set(encryptedBytes, SALT_LENGTH + IV_LENGTH);

    return arrayBufferToBase64(result.buffer);
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data. Please check your master password.');
  }
}

// Decrypt data with AES-256-GCM
export async function decryptData(
  ciphertext: string,
  masterPassword: string
): Promise<string> {
  try {
    const data = new Uint8Array(base64ToArrayBuffer(ciphertext));

    // Extract components
    const salt = data.slice(0, SALT_LENGTH);
    const iv = data.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const encrypted = data.slice(SALT_LENGTH + IV_LENGTH);

    const key = await deriveKey(masterPassword, salt);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv, tagLength: 128 },
      key,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data. Incorrect master password or corrupted data.');
  }
}

// Hash master password for verification (not for encryption)
export async function hashMasterPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return arrayBufferToBase64(hash);
}

// Verify master password hash
export async function verifyMasterPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const computedHash = await hashMasterPassword(password);
  return computedHash === hash;
}

// Generate a secure random password
export function generateSecurePassword(
  length: number = 16,
  options: {
    uppercase?: boolean;
    lowercase?: boolean;
    numbers?: boolean;
    symbols?: boolean;
  } = {}
): string {
  const defaults = {
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  };
  const opts = { ...defaults, ...options };

  const chars = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  };

  let charset = '';
  if (opts.uppercase) charset += chars.uppercase;
  if (opts.lowercase) charset += chars.lowercase;
  if (opts.numbers) charset += chars.numbers;
  if (opts.symbols) charset += chars.symbols;

  if (!charset) charset = chars.lowercase;

  const randomValues = getRandomBytes(length);
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[randomValues[i] % charset.length];
  }

  return password;
}

// Calculate password entropy
export function calculateEntropy(password: string): number {
  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32;

  if (charsetSize === 0) return 0;
  return Math.round(password.length * Math.log2(charsetSize));
}

// Export encrypted backup
export async function exportEncryptedBackup(
  data: unknown,
  masterPassword: string
): Promise<string> {
  const jsonString = JSON.stringify(data);
  return encryptData(jsonString, masterPassword);
}

// Import encrypted backup
export async function importEncryptedBackup(
  encryptedBackup: string,
  masterPassword: string
): Promise<unknown> {
  const decrypted = await decryptData(encryptedBackup, masterPassword);
  return JSON.parse(decrypted);
}