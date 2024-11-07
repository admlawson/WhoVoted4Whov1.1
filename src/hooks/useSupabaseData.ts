import { useEffect, useState } from 'react';
import { getSupabaseClient } from '../lib/supabase';
import type { Election } from '../types/election';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export function useSupabaseData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();
  const supabase = getSupabaseClient();

  const ensureTableExists = async () => {
    if (!supabase || !session) return;

    try {
      const { error } = await supabase.rpc('create_election_tables');
      if (error && !error.message.includes('already exists')) {
        throw error;
      }
    } catch (err) {
      console.error('Table creation error:', err);
      throw err;
    }
  };

  const syncData = async (elections: Election[]) => {
    if (!supabase || !session) {
      throw new Error('Supabase client or session not available');
    }

    setLoading(true);
    setError(null);

    try {
      await ensureTableExists();

      // First, clear existing data
      const { error: deleteError } = await supabase
        .from('election_data')
        .delete()
        .neq('id', 0);

      if (deleteError) throw deleteError;

      // Insert new data in batches
      const batchSize = 50;
      for (let i = 0; i < elections.length; i += batchSize) {
        const batch = elections.slice(i, i + batchSize).map(election => ({
          year: election.year,
          data: election
        }));

        const { error: insertError } = await supabase
          .from('election_data')
          .insert(batch);

        if (insertError) throw insertError;
      }

      toast.success('Data synchronized successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sync data';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (): Promise<Election[]> => {
    if (!supabase || !session) {
      throw new Error('Supabase client or session not available');
    }

    setLoading(true);
    setError(null);

    try {
      await ensureTableExists();

      const { data, error } = await supabase
        .from('election_data')
        .select('*')
        .order('year', { ascending: false });

      if (error) throw error;

      return data.map(row => row.data as Election);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (supabase && session) {
      ensureTableExists().catch(console.error);
    }
  }, [supabase, session]);

  return {
    syncData,
    fetchData,
    loading,
    error
  };
}