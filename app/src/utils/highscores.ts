import {API_KEY, API_BASE_URL} from '@env';

export interface HighscoreEntry {
  user_id: number;
  username: string;
  score: number;
}

/**
 * Fetch highscores for a given wordlist from the backend.
 */
export async function fetchHighscores(wordlist: string): Promise<HighscoreEntry[]> {
  const response = await fetch(
    `${API_BASE_URL}/highscores?wordlist=${encodeURIComponent(wordlist)}`,
    {
      headers: {
        'X-API-KEY': API_KEY,
      },
    },
  );

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.highscores || [];
}
