import CryptoJS from 'crypto-js';
import RNFS from 'react-native-fs';
import {Platform} from 'react-native';

// Must match the key used in scripts/encrypt-solutions.js
const ENCRYPTION_KEY = '4f6b7a9c2e1d8f3a5b0c7d4e9f2a1b6c8d3e0f5a7b9c4d2e1f8a3b6c0d5e7f9a';

/**
 * Get the base path for bundled assets.
 * On Android, assets are in the APK and accessed via a special prefix.
 * On iOS, they're in the main bundle directory.
 */
function getAssetBasePath(): string {
  if (Platform.OS === 'android') {
    return RNFS.DocumentDirectoryPath + '/../';
  }
  return RNFS.MainBundlePath;
}

/**
 * Read a bundled asset file as a string.
 */
async function readAssetFile(relativePath: string): Promise<string> {
  if (Platform.OS === 'android') {
    // On Android, bundled assets are read via readFileAssets
    return RNFS.readFileAssets(relativePath, 'utf8');
  }
  // On iOS, assets are in the main bundle
  const fullPath = `${RNFS.MainBundlePath}/${relativePath}`;
  return RNFS.readFile(fullPath, 'utf8');
}

/**
 * Decrypt content that was encrypted by encrypt-solutions.js.
 * Format: base64(iv):base64(ciphertext)
 */
function decrypt(encryptedContent: string): string {
  const [ivBase64, ciphertextBase64] = encryptedContent.split(':');
  if (!ivBase64 || !ciphertextBase64) {
    throw new Error('Invalid encrypted file format');
  }

  const key = CryptoJS.enc.Hex.parse(ENCRYPTION_KEY);
  const iv = CryptoJS.enc.Base64.parse(ivBase64);
  const ciphertext = CryptoJS.enc.Base64.parse(ciphertextBase64);

  const decrypted = CryptoJS.AES.decrypt(
    {ciphertext} as CryptoJS.lib.CipherParams,
    key,
    {iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7},
  );

  return decrypted.toString(CryptoJS.enc.Utf8);
}

/**
 * Load and decrypt a solutions file.
 * @param gridSize - 3, 4, 5, or 6
 * @returns The decrypted solutions text content
 */
export async function loadSolutions(gridSize: number): Promise<string> {
  const filename = `solutions/solutions_${gridSize}.enc`;
  const encrypted = await readAssetFile(filename);
  return decrypt(encrypted);
}

/**
 * Load a wordlist file (not encrypted).
 * @param filename - e.g. "joukahainen_5.txt"
 * @returns The wordlist text content
 */
export async function loadWordlist(filename: string): Promise<string> {
  const path = `wordlists/${filename}`;
  return readAssetFile(path);
}

/**
 * Parse solutions text into arrays of word groups.
 * Format: first line is metadata (skipped), then groups of N words separated by --- lines.
 */
export function parseSolutions(text: string): string[][] {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const solutions: string[][] = [];
  let currentGroup: string[] = [];

  // Skip the first line (metadata)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === '---') {
      if (currentGroup.length > 0) {
        solutions.push(currentGroup);
        currentGroup = [];
      }
    } else {
      currentGroup.push(line);
    }
  }
  if (currentGroup.length > 0) {
    solutions.push(currentGroup);
  }

  return solutions;
}

/**
 * Parse a wordlist file into an array of words.
 */
export function parseWordlist(text: string): string[] {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}
