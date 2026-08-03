import {API_KEY, API_BASE_URL} from '@env';
import {getUserProfile} from './userProfile';

/**
 * Report a grid initiation to the backend.
 * Fires silently — never throws or alerts the user.
 */
export function reportInitiation(wordlistFile: string): void {
  (async () => {
    try {
      const profile = await getUserProfile();
      await fetch(`${API_BASE_URL}/initiation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY,
        },
        body: JSON.stringify({
          user_id: profile?.id ?? null,
          wordlist: wordlistFile,
        }),
      });
    } catch {
      // Silently ignore errors
    }
  })();
}
