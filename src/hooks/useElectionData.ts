import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../config/constants';
import type { Election } from '../types/election';
import { getStoredElectionData } from '../services/dataSync';
import { staticElectionData } from '../data/staticElections';

export function useElectionData(primaryYear: number, comparisonYear: number) {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [primaryElection, setPrimaryElection] = useState<Election | null>(null);
  const [comparisonElection, setComparisonElection] = useState<Election | null>(null);

  useEffect(() => {
    const loadElectionData = () => {
      setLoading(true);
      setError(null);

      try {
        // First, try to get stored data from admin
        let electionData = getStoredElectionData();

        // If no stored data exists, use static data
        if (!electionData) {
          electionData = staticElectionData;
        }

        setElections(electionData);

        // Find the elections for the selected years
        const primary = electionData.find(e => e.year === primaryYear);
        const comparison = electionData.find(e => e.year === comparisonYear);

        if (!primary || !comparison) {
          throw new Error(`Election data not available for ${!primary ? primaryYear : comparisonYear}`);
        }

        setPrimaryElection(primary);
        setComparisonElection(comparison);
      } catch (err) {
        console.error('Error loading election data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load election data');
      } finally {
        setLoading(false);
      }
    };

    loadElectionData();

    // Listen for data updates from admin panel
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.ELECTION_DATA) {
        loadElectionData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [primaryYear, comparisonYear]);

  return {
    elections,
    loading,
    error,
    primaryElection,
    comparisonElection
  };
}