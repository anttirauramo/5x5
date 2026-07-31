import CryptoJS from 'crypto-js';
import LAST_WORDS_ENCRYPTED from '../generated/lastWords';

const ENCRYPTION_KEY = '4f6b7a9c2e1d8f3a5b0c7d4e9f2a1b6c8d3e0f5a7b9c4d2e1f8a3b6c0d5e7f9a';

/**
 * Decrypt content encrypted by prepare-assets.js.
 * Format: base64(iv):base64(ciphertext)
 */
function decrypt(encryptedContent: string): string {
  const [ivBase64, ciphertextBase64] = encryptedContent.split(':');
  if (!ivBase64 || !ciphertextBase64) {
    throw new Error('Invalid encrypted content format');
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
 * Get the number of days since Unix epoch for today.
 */
function getDaysSinceEpoch(): number {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor(startOfDay.getTime() / (1000 * 60 * 60 * 24));
}

/**
 * Get the word of the day from the last_words list for the given vocabulary.
 * Selection is deterministic: daysSinceEpoch % wordCount.
 *
 * @param wordlistKey - e.g. 'nykysuomi_3' (matches the wordlist filename without .txt)
 * @returns The word of the day, or null if no last_words file exists for this vocabulary
 */
export function getLastWordOfTheDay(wordlistKey: string): string | null {
  const result = getLastWordInfo(wordlistKey);
  return result ? result.word : null;
}

/**
 * Get the word of the day along with its index and total count.
 */
export function getLastWordInfo(wordlistKey: string): {word: string; index: number; count: number} | null {
  const encrypted = LAST_WORDS_ENCRYPTED[wordlistKey];
  if (!encrypted) {
    return null;
  }

  const decrypted = decrypt(encrypted);
  const words = decrypted
    .split('\n')
    .map(w => w.trim())
    .filter(w => w.length > 0);

  if (words.length === 0) {
    return null;
  }

  const dayIndex = getDaysSinceEpoch() % words.length;
  return {word: words[dayIndex], index: dayIndex, count: words.length};
}

/**
 * Check if a last_words file exists for the given vocabulary.
 */
export function hasLastWords(wordlistKey: string): boolean {
  return wordlistKey in LAST_WORDS_ENCRYPTED;
}
