import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching profiles:', error);
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
    }

    const list = data || [];
    
    // Alléger la charge pour l'affichage liste : ne renvoyer que des métadonnées légères
    const trimmed = list.map((p: any) => {
      // Supabase retourne généralement les JSONB comme objets, mais on vérifie quand même
      let riot = p.riot;
      if (typeof riot === 'string') {
        try {
          riot = JSON.parse(riot);
        } catch (e) {
          riot = null;
        }
      }

      let qualities = p.qualities;
      if (typeof qualities === 'string') {
        try {
          qualities = JSON.parse(qualities);
        } catch (e) {
          qualities = [];
        }
      }
      if (!Array.isArray(qualities)) qualities = [];

      let roles = p.roles;
      if (typeof roles === 'string') {
        try {
          roles = JSON.parse(roles);
        } catch (e) {
          roles = [];
        }
      }
      if (!Array.isArray(roles)) roles = [];

      let vods = p.vods;
      if (typeof vods === 'string') {
        try {
          vods = JSON.parse(vods);
        } catch (e) {
          vods = [];
        }
      }
      if (!Array.isArray(vods)) vods = [];

      const lightDetails = Array.isArray(riot?.recentMatchDetails)
        ? riot.recentMatchDetails.slice(0, 2).map((m: any) => ({
            metadata: { matchId: m?.metadata?.matchId },
            info: m?.info
              ? {
                  gameMode: m.info.gameMode,
                  gameDuration: m.info.gameDuration,
                }
              : undefined,
          }))
        : undefined;
      
      return {
        ...p,
        qualities,
        roles,
        vods,
        riot: riot
          ? {
              ...riot,
              recentMatchDetails: lightDetails,
              championMasteries: undefined,
            }
          : undefined,
      };
    });
    
    return NextResponse.json(trimmed);
  } catch (e: any) {
    console.error('GET /api/profiles error:', e);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || !body.puuid) {
      return NextResponse.json({ error: 'puuid is required' }, { status: 400 });
    }

    // Préparer les données pour Supabase
    const profileData = {
      puuid: body.puuid,
      name: body.name || '',
      gameName: body.gameName || null,
      tagLine: body.tagLine || null,
      description: body.description || '',
      qualities: body.qualities || [],
      roles: body.roles || [],
      vods: body.vods || [],
      contact: body.contact || null,
      riot: body.riot || null,
    };

    // Vérifier si le profil existe déjà
    const { data: existing } = await supabase
      .from('profiles')
      .select('puuid')
      .eq('puuid', body.puuid)
      .single();

    if (existing) {
      // Mise à jour
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('puuid', body.puuid);

      if (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
      }
    } else {
      // Insertion
      const { error } = await supabase
        .from('profiles')
        .insert([profileData]);

      if (error) {
        console.error('Error inserting profile:', error);
        return NextResponse.json({ error: 'Failed to insert profile' }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('POST /api/profiles error', e);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .neq('id', 0); // Supprime tous les profils (condition toujours vraie)

    if (error) {
      console.error('Error deleting profiles:', error);
      return NextResponse.json({ error: 'Failed to delete profiles' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: 'Tous les profils ont été supprimés' });
  } catch (e: any) {
    console.error('DELETE /api/profiles error', e);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

