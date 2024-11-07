import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import toast from 'react-hot-toast';

let supabase: ReturnType<typeof createClient<Database>> | null = null;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const initializeDatabase = async () => {
  if (!supabase) return;

  try {
    // Create election_data table if it doesn't exist
    const { error: tableError } = await supabase.rpc('create_election_tables');
    
    if (tableError && !tableError.message.includes('already exists')) {
      throw tableError;
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    toast.error('Failed to initialize database');
  }
};

export const getSupabaseClient = () => {
  if (!supabase && supabaseUrl && supabaseAnonKey) {
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
    initializeDatabase();
  }
  return supabase;
};

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};