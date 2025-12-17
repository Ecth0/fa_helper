import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type pour les profils
export interface ProfileRow {
  id?: number;
  puuid: string;
  name: string;
  gameName?: string;
  tagLine?: string;
  description?: string;
  qualities?: string[];
  roles?: string[];
  vods?: any[];
  contact?: string;
  riot?: any;
  created_at?: string;
  updated_at?: string;
}

