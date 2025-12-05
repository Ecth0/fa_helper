/**
 * EXEMPLE D'INTÉGRATION AVEC UN BACKEND
 * 
 * Ce fichier montre comment transformer le localStorage
 * en une véritable API backend avec une base de données.
 */

// EXEMPLE 1: API ROUTE POUR SAUVEGARDER LE PROFIL
// Créer: src/app/api/profile/route.ts

/*
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const profileData = await request.json();

    // Validation
    if (!profileData.name || !profileData.description) {
      return NextResponse.json(
        { error: 'Nom et description requis' },
        { status: 400 }
      );
    }

    // Sauvegarder en base de données (exemple avec Prisma)
    // const profile = await prisma.playerProfile.create({
    //   data: {
    //     name: profileData.name,
    //     description: profileData.description,
    //     qualities: profileData.qualities,
    //     vods: profileData.vods,
    //     userId: getCurrentUserId(), // À implémenter
    //   },
    // });

    return NextResponse.json({
      success: true,
      profileId: 'profile-id-here',
      message: 'Profil sauvegardé avec succès'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Récupérer l'ID utilisateur depuis la session
    // const userId = getCurrentUserId();

    // Récupérer le profil de la base de données
    // const profile = await prisma.playerProfile.findUnique({
    //   where: { userId },
    // });

    // if (!profile) {
    //   return NextResponse.json(
    //     { error: 'Profil non trouvé' },
    //     { status: 404 }
    //   );
    // }

    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du profil' },
      { status: 500 }
    );
  }
}
*/

// EXEMPLE 2: SCHÉMA PRISMA
// Créer: prisma/schema.prisma

/*
model PlayerProfile {
  id        String   @id @default(cuid())
  userId    String   @unique
  name      String
  description String
  qualities String[]
  vods      VOD[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])
}

model VOD {
  id          String   @id @default(cuid())
  videoId     String
  title       String
  thumbnail   String
  url         String
  profileId   String
  createdAt   DateTime @default(now())

  profile     PlayerProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)
}
*/

// EXEMPLE 3: SERVICE POUR APPELER L'API
// Créer: src/lib/api/profile.ts

/*
export async function saveProfile(profileData: ProfileData) {
  const response = await fetch('/api/profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la sauvegarde');
  }

  return response.json();
}

export async function getProfile(profileId: string) {
  const response = await fetch(`/api/profile/${profileId}`);

  if (!response.ok) {
    throw new Error('Profil non trouvé');
  }

  return response.json();
}

export async function updateProfile(profileId: string, data: ProfileData) {
  const response = await fetch(`/api/profile/${profileId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la mise à jour');
  }

  return response.json();
}

export async function deleteProfile(profileId: string) {
  const response = await fetch(`/api/profile/${profileId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la suppression');
  }

  return response.json();
}
*/

// EXEMPLE 4: UTILISATION DANS LE COMPOSANT
// Remplacer le localStorage par l'API

/*
const handleSaveProfile = async () => {
  if (!profile.name.trim()) {
    toast.error('Veuillez entrer un nom');
    return;
  }

  setIsSaving(true);
  try {
    // Appeler l'API au lieu de localStorage
    const result = await saveProfile(profile);
    
    toast.success('Profil sauvegardé avec succès !');
    setTimeout(() => {
      router.push(`/profile/${result.profileId}`);
    }, 1000);
  } catch (error) {
    console.error('Erreur:', error);
    toast.error('Erreur lors de la sauvegarde du profil');
  } finally {
    setIsSaving(false);
  }
};
*/

// EXEMPLE 5: AUTHENTIFICATION
// Vous devrez implémenter l'authentification pour:
// - Associer les profils aux utilisateurs
// - Empêcher les modifications non autorisées
// - Implémenter les sessions utilisateur

// Suggestions de packages:
// - next-auth: https://next-auth.js.org/
// - Auth0: https://auth0.com/
// - Clerk: https://clerk.com/
// - Supabase Auth: https://supabase.com/

export {};
