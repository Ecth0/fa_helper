import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function slugify(s: string) {
  return s
    .toString()
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    if (!supabase) {
      console.error('Supabase client not initialized. Check environment variables.');
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { slug } = await context.params;
    
    // Récupérer tous les profils et chercher par slug
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) {
      console.error('Error fetching profiles:', error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    const found = (data || []).find((p: any) => slugify(p?.name || '') === slug);
    
    if (!found) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }

    // Convertir les JSONB en objets JavaScript (Supabase les retourne généralement comme objets)
    const parseJsonb = (value: any, defaultValue: any = null) => {
      if (value === null || value === undefined) return defaultValue;
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch (e) {
          return defaultValue;
        }
      }
      return value;
    };

    const profile = {
      ...found,
      qualities: Array.isArray(found.qualities) ? found.qualities : parseJsonb(found.qualities, []),
      roles: Array.isArray(found.roles) ? found.roles : parseJsonb(found.roles, []),
      vods: Array.isArray(found.vods) ? found.vods : parseJsonb(found.vods, []),
      riot: parseJsonb(found.riot, null),
    };

    return NextResponse.json(profile);
  } catch (e: any) {
    console.error('GET /api/profiles/[slug] error:', e);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

