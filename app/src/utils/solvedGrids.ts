import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@solved_grids';

export interface SolvedGrid {
  /** The grid as a 2D array of letters */
  grid: string[][];
  /** Wordlist file name (e.g. 'nykysuomi_5.txt') */
  wordlistFile: string;
  /** ISO timestamp when the solution was first found */
  solvedAt: string;
}

/**
 * Generate a unique key for a solved grid to avoid duplicates.
 * Uses the grid content + wordlist as the identity.
 */
function gridKey(grid: string[][], wordlistFile: string): string {
  const gridStr = grid.map(row => row.join('')).join('/');
  return `${wordlistFile}:${gridStr}`;
}

/**
 * Load all solved grids from storage.
 */
export async function loadSolvedGrids(): Promise<SolvedGrid[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) {return [];}
    return JSON.parse(json) as SolvedGrid[];
  } catch {
    return [];
  }
}

/**
 * Save a solved grid if it hasn't been saved before.
 * Returns true if the grid was new and saved, false if it already existed.
 */
export async function saveSolvedGrid(grid: string[][], wordlistFile: string): Promise<boolean> {
  const existing = await loadSolvedGrids();
  const key = gridKey(grid, wordlistFile);

  // Check if this exact solution already exists
  const alreadyExists = existing.some(
    entry => gridKey(entry.grid, entry.wordlistFile) === key,
  );

  if (alreadyExists) {
    return false;
  }

  const newEntry: SolvedGrid = {
    grid,
    wordlistFile,
    solvedAt: new Date().toISOString(),
  };

  existing.unshift(newEntry); // newest first
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  return true;
}

/**
 * Get the count of solved grids for a specific wordlist.
 */
export async function getSolvedCount(wordlistFile?: string): Promise<number> {
  const grids = await loadSolvedGrids();
  if (!wordlistFile) {return grids.length;}
  return grids.filter(g => g.wordlistFile === wordlistFile).length;
}
