import {inflate} from 'pako';
import WORDLISTS_COMPRESSED from '../generated/wordlists';

// Cache decompressed wordlists to avoid repeated decompression
const cache: Record<string, string[]> = {};

/**
 * Decode a base64 string to Uint8Array.
 */
function base64ToBytes(base64: string): Uint8Array {
  // React Native has a global atob
  const binaryStr = (globalThis as any).atob(base64) as string;
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
}

/**
 * Convert Uint8Array to string (UTF-8).
 */
function uint8ArrayToString(arr: Uint8Array): string {
  // Build string in chunks to avoid stack overflow on large arrays
  const CHUNK_SIZE = 8192;
  let result = '';
  for (let i = 0; i < arr.length; i += CHUNK_SIZE) {
    const chunk = arr.subarray(i, i + CHUNK_SIZE);
    result += String.fromCharCode(...chunk);
  }
  return decodeURIComponent(escape(result));
}

/**
 * Decompress and parse a wordlist by key.
 * Results are cached after first decompression.
 */
export function getWordlist(key: string): string[] {
  if (cache[key]) {
    return cache[key];
  }

  const compressed = WORDLISTS_COMPRESSED[key];
  if (!compressed) {
    return [];
  }

  // Decode base64 to binary and decompress gzip
  const bytes = base64ToBytes(compressed);
  const decompressed = inflate(bytes);

  // Convert Uint8Array to string
  const text = uint8ArrayToString(decompressed);

  // Parse into word array
  const words = text
    .split('\n')
    .map((w: string) => w.trim())
    .filter((w: string) => w.length > 0);

  cache[key] = words;
  return words;
}

/**
 * Get all available wordlist keys.
 */
export function getWordlistKeys(): string[] {
  return Object.keys(WORDLISTS_COMPRESSED);
}
