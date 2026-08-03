import {API_KEY, API_BASE_URL} from '@env';
import {getUserProfile} from './userProfile';
import {loadSolvedGrids, SolvedGrid} from './solvedGrids';

/**
 * Format a grid as a string for the backend (rows joined with /).
 */
function gridToString(grid: string[][]): string {
  return grid.map(row => row.join('')).join('/');
}

/**
 * Send a single completion to the backend.
 */
export async function syncCompletion(grid: string[][], wordlistFile: string): Promise<void> {
  const profile = await getUserProfile();
  if (!profile) {return;}

  const completion = {
    grid: gridToString(grid),
    wordlist: wordlistFile,
  };

  await fetch(`${API_BASE_URL}/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': API_KEY,
    },
    body: JSON.stringify({
      user_id: profile.id,
      completions: [completion],
    }),
  });
}

/**
 * Sync all locally stored completions to the backend.
 * Used after registration to upload existing completions.
 */
export async function syncAllCompletions(): Promise<void> {
  const profile = await getUserProfile();
  if (!profile) {return;}

  const solvedGrids = await loadSolvedGrids();
  if (solvedGrids.length === 0) {return;}

  const completions = solvedGrids.map((entry: SolvedGrid) => ({
    grid: gridToString(entry.grid),
    wordlist: entry.wordlistFile,
  }));

  // Send in batches of 100 to avoid request size limits
  const BATCH_SIZE = 100;
  for (let i = 0; i < completions.length; i += BATCH_SIZE) {
    const batch = completions.slice(i, i + BATCH_SIZE);
    await fetch(`${API_BASE_URL}/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': API_KEY,
      },
      body: JSON.stringify({
        user_id: profile.id,
        completions: batch,
      }),
    });
  }
}
