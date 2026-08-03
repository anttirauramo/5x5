import {API_KEY, API_BASE_URL} from '@env';

export interface HighscoreEntry {
  user_id: number;
  username: string;
  score: number;
}

export interface HallOfFameWordlist {
  wordlist: string;
  count: number;
}

export interface HallOfFameEntry {
  user_id: number;
  username: string;
  wordlists: HallOfFameWordlist[];
  total: number;
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

/**
 * Fetch hall of fame (all wordlists combined) from the backend.
 */
export async function fetchHallOfFame(): Promise<HallOfFameEntry[]> {
  const response = await fetch(
    `${API_BASE_URL}/hall_of_fame`,
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
  return data.hall_of_fame || [];
}
