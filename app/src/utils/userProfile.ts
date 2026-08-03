import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_KEY, API_BASE_URL} from '@env';

const USER_STORAGE_KEY = '@user_profile';

export interface UserProfile {
  id: number;
  username: string;
}

/**
 * Get the stored user profile, or null if not registered.
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const json = await AsyncStorage.getItem(USER_STORAGE_KEY);
    if (!json) {return null;}
    return JSON.parse(json) as UserProfile;
  } catch {
    return null;
  }
}

/**
 * Register a new user with the backend and store the profile locally.
 */
export async function registerUser(username: string): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': API_KEY,
    },
    body: JSON.stringify({username}),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.message || 'Registration failed');
  }

  const data = await response.json();
  const profile: UserProfile = {
    id: data.id,
    username: data.username,
  };

  await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
  return profile;
}

/**
 * Check if the user is registered.
 */
export async function isRegistered(): Promise<boolean> {
  const profile = await getUserProfile();
  return profile !== null;
}

/**
 * Check if the locally stored user exists in the backend.
 * Returns true if user exists, false if not, null if check failed.
 */
export async function checkUserExists(): Promise<boolean | null> {
  const profile = await getUserProfile();
  if (!profile) {return null;}

  try {
    const response = await fetch(
      `${API_BASE_URL}/user_status?user_id=${profile.id}`,
      {headers: {'X-API-KEY': API_KEY}},
    );
    if (!response.ok) {return null;}
    const data = await response.json();
    return data.exists === true;
  } catch {
    return null;
  }
}

/**
 * Clear the locally stored user profile.
 */
export async function clearUserProfile(): Promise<void> {
  await AsyncStorage.removeItem(USER_STORAGE_KEY);
}
