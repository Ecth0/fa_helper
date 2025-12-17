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

    // Convertir les JSONB en objets JavaScript
    const profile = {
      ...found,
      qualities: typeof found.qualities === 'string' ? JSON.parse(found.qualities) : found.qualities,
      roles: typeof found.roles === 'string' ? JSON.parse(found.roles) : found.roles,
      vods: typeof found.vods === 'string' ? JSON.parse(found.vods) : found.vods,
      riot: typeof found.riot === 'string' ? JSON.parse(found.riot) : found.riot,
    };

    return NextResponse.json(profile);
  } catch (e: any) {
    console.error('GET /api/profiles/[slug] error:', e);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

