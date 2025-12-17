import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// En développement, on ne throw pas d'erreur pour éviter de casser le build
// mais on log un avertissement
if ((!supabaseUrl || !supabaseAnonKey) && typeof window === 'undefined') {
  console.warn('⚠️ Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-key');

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

