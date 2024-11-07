import { Election } from '../types/election';
import { staticElectionData } from '../data/staticElections';
import { STORAGE_KEYS, CACHE_KEYS } from '../config/constants';

interface StoredData {
  timestamp: number;
  elections: Election[];
  version: string;
}

export async function syncElectionData(): Promise<Election[]> {
  try {
    // Fetch and process the latest data
    const combinedData = staticElectionData.sort((a, b) => b.year - a.year);

    // Prepare data for persistent storage
    const storedData: StoredData = {
      timestamp: Date.now(),
      elections: combinedData,
      version: '1.0' // For future data structure changes
    };

    // Store the data persistently
    localStorage.setItem(STORAGE_KEYS.ELECTION_DATA, JSON.stringify(storedData));
    localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, new Date().toISOString());

    // Clear any existing API cache
    Object.keys(localStorage)
      .filter(key => key.startsWith(CACHE_KEYS.API_RESPONSES))
      .forEach(key => localStorage.removeItem(key));

    // Update last sync time for API cache
    localStorage.setItem(CACHE_KEYS.LAST_SYNC, new Date().toISOString());

    // Notify all tabs of the update
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEYS.ELECTION_DATA,
      newValue: JSON.stringify(storedData)
    }));

    return combinedData;
  } catch (error) {
    console.error('Data sync failed:', error);
    throw error;
  }
}

export function getStoredElectionData(): Election[] | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ELECTION_DATA);
    if (!stored) return null;

    const data: StoredData = JSON.parse(stored);
    return data.elections;
  } catch (error) {
    console.error('Error reading stored data:', error);
    return null;
  }
}

export function isDataStale(): boolean {
  const lastUpdate = localStorage.getItem(STORAGE_KEYS.LAST_UPDATE);
  if (!lastUpdate) return true;

  const updateTime = new Date(lastUpdate).getTime();
  return Date.now() - updateTime > DATA_UPDATE_REMINDER;
}