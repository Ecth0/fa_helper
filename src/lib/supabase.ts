import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Vérifier que les variables sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window === 'undefined') {
    // Côté serveur, on log une erreur mais on crée quand même le client
    // pour éviter de casser le build. L'erreur sera visible dans les logs.
    console.error('❌ Missing Supabase environment variables!');
    console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel project settings.');
    console.error('Go to: Settings > Environment Variables');
  }
}

// Créer le client seulement si les variables sont définies
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

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

