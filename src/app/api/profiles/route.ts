import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    if (!supabase) {
      console.error('Supabase client not initialized. Check environment variables.');
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    console.log('🔍 Fetching profiles from Supabase...');
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching profiles:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch profiles', 
        details: error.message,
        code: error.code 
      }, { status: 500 });
    }

    console.log(`✅ Found ${data?.length || 0} profiles in database`);
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
    console.log('🔵 POST /api/profiles - Début de la requête');
    
    if (!supabase) {
      console.error('❌ Supabase client not initialized. Vérifiez les variables d\'environnement :');
      console.error(`- NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Défini' : '❌ Manquant'}`);
      console.error(`- NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Défini' : '❌ Manquant'}`);
      
      return NextResponse.json({ 
        error: 'Base de données non configurée',
        details: 'Le client Supabase n\'a pas pu être initialisé. Vérifiez les logs du serveur pour plus de détails.'
      }, { status: 500 });
    }
    
    console.log('🔵 Supabase client initialisé avec succès');

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

    // Vérifier si le profil existe déjà (utiliser maybeSingle pour éviter les erreurs si non trouvé)
    console.log(`🔍 Vérification de l'existence du profil avec puuid: ${body.puuid}`);
    
    try {
      const { data: existing, error: checkError } = await supabase
        .from('profiles')
        .select('puuid')
        .eq('puuid', body.puuid)
        .maybeSingle();

      if (checkError) {
        if (checkError.code === 'PGRST116') { // PGRST116 = no rows returned
          console.log('ℹ️ Aucun profil existant trouvé, création d\'un nouveau profil');
        } else {
          console.error('❌ Erreur lors de la vérification du profil existant:', {
            code: checkError.code,
            message: checkError.message,
            details: checkError.details,
            hint: checkError.hint
          });
          return NextResponse.json({ 
            error: 'Échec de la vérification du profil', 
            details: checkError.message,
            code: checkError.code,
            hint: checkError.hint
          }, { status: 500 });
        }
      } else {
        console.log(`ℹ️ Profil existant ${existing ? 'trouvé' : 'non trouvé'}`);
      }

      if (existing) {
        // Mise à jour
        console.log('🔄 Mise à jour du profil existant...');
        const { error: updateError } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('puuid', body.puuid);

        if (updateError) {
          console.error('❌ Erreur lors de la mise à jour du profil:', {
            code: updateError.code,
            message: updateError.message,
            details: updateError.details,
            hint: updateError.hint
          });
          return NextResponse.json({ 
            error: 'Échec de la mise à jour du profil', 
            details: updateError.message,
            code: updateError.code,
            hint: updateError.hint
          }, { status: 500 });
        }
        console.log(`✅ Profil mis à jour avec succès: ${body.puuid}`);
      } else {
        // Insertion
        console.log('➕ Création d\'un nouveau profil...');
        const { data: insertedData, error: insertError } = await supabase
          .from('profiles')
          .insert([profileData])
          .select();

        if (insertError) {
          console.error('❌ Erreur lors de la création du profil:', {
            code: insertError.code,
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint
          });
          return NextResponse.json({ 
            error: 'Échec de la création du profil', 
            details: insertError.message,
            code: insertError.code,
            hint: insertError.hint
          }, { status: 500 });
        }
        console.log('✅ Profil créé avec succès:', body.puuid, insertedData);
      }

      return NextResponse.json({ ok: true });
    } catch (error) {
      console.error('❌ Erreur inattendue lors de la vérification du profil:', error);
      return NextResponse.json({ 
        error: 'Erreur inattendue lors de la vérification du profil',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, { status: 500 });
    }
  } catch (e: any) {
    console.error('POST /api/profiles error', e);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    if (!supabase) {
      console.error('Supabase client not initialized. Check environment variables.');
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

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

