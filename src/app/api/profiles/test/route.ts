import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Endpoint de test pour vérifier la connexion Supabase
export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({ 
        error: 'Supabase client not initialized',
        check: 'Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set'
      }, { status: 500 });
    }

    // Test 1: Compter les profils
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Test 2: Récupérer tous les profils
    const { data, error: selectError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);

    return NextResponse.json({
      success: true,
      supabaseConfigured: true,
      profileCount: count || 0,
      profiles: data || [],
      errors: {
        count: countError ? { message: countError.message, code: countError.code } : null,
        select: selectError ? { message: selectError.message, code: selectError.code } : null,
      }
    });
  } catch (e: any) {
    return NextResponse.json({
      success: false,
      error: e.message,
      stack: e.stack
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

