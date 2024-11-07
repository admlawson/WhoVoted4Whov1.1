import { useState, useEffect } from 'react';
import { STORAGE_KEYS, DATA_UPDATE_REMINDER } from '../config/constants';

export function useLastUpdate() {
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    const updateTimestamp = () => {
      const timestamp = localStorage.getItem(STORAGE_KEYS.LAST_UPDATE);
      setLastUpdate(timestamp);

      if (timestamp) {
        const updateTime = new Date(timestamp).getTime();
        setIsStale(Date.now() - updateTime > DATA_UPDATE_REMINDER);
      }
    };

    updateTimestamp();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.LAST_UPDATE) {
        updateTimestamp();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateLastUpdate = () => {
    const timestamp = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, timestamp);
    setLastUpdate(timestamp);
    setIsStale(false);
  };

  return { lastUpdate, isStale, updateLastUpdate };
}