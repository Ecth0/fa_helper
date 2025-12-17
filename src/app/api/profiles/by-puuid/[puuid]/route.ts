import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ puuid: string }> }
) {
  try {
    if (!supabase) {
      console.error('Supabase client not initialized. Check environment variables.');
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { puuid } = await context.params;
    if (!puuid) {
      return NextResponse.json({ error: 'puuid is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('puuid', puuid);

    if (error) {
      console.error('Error deleting profile:', error);
      return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 });
    }
    
    return NextResponse.json({ ok: true, message: 'Profil supprimé avec succès' });
  } catch (e: any) {
    console.error('DELETE /api/profiles/by-puuid/[puuid] error', e);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

