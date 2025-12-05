"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';

interface ProfileData {
  name: string;
  description: string;
  qualities: string[];
  roles: string[];
  vods: Array<{
    id: string;
    url: string;
    title: string;
    thumbnail: string;
  }>;
}

export default function ViewProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Récupérer le profil depuis le localStorage ou l'API
    const storedProfile = localStorage.getItem('playerProfile');
    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile);
        // garantir les tableaux par défaut si la structure est ancienne
        const normalized: ProfileData = {
          name: parsed.name || '',
          description: parsed.description || '',
          qualities: Array.isArray(parsed.qualities) ? parsed.qualities : [],
          roles: Array.isArray(parsed.roles) ? parsed.roles : [],
          vods: Array.isArray(parsed.vods) ? parsed.vods : [],
        };
        setProfile(normalized);
      } catch (err) {
        console.error('Erreur parsing storedProfile', err);
        setProfile(null);
      }
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p>Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-950 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Aucun profil trouvé</h1>
          <p className="text-gray-400 mb-8">Vous devez d'abord créer votre profil.</p>
          <Link href="/create-profile">
            <Button className="bg-red-600 hover:bg-red-700">
              Créer mon profil
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Retour */}
        <Link href="/profile" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition">
          <ArrowLeft className="w-4 h-4" />
          Retour à l'édition
        </Link>

        {/* En-tête du profil */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-gray-800 rounded-lg p-8 mb-8">
          <h1 className="text-4xl font-bold mb-2">{profile.name}</h1>
          <p className="text-gray-400 mb-6">{profile.description || 'Aucune description'}</p>

          {/* Qualités */}
          { (profile.roles?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {profile.roles.map((role) => (
                <span
                  key={role}
                  className="bg-green-600/20 border border-green-600/50 text-green-300 px-3 py-1 rounded-full text-sm"
                >
                  {role}
                </span>
              ))}
            </div>
          )}

          {/* Qualités */}
          {profile.qualities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {profile.qualities.map((quality) => (
                <span
                  key={quality}
                  className="bg-blue-600/20 border border-blue-600/50 text-blue-300 px-4 py-2 rounded-full text-sm"
                >
                  {quality}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* VODs */}
        <div>
          <h2 className="text-3xl font-bold mb-6">Mes VODs</h2>

          {profile.vods.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.vods.map((vod) => (
                <div key={vod.id} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition group">
                  <a
                    href={`https://youtube.com/watch?v=${vod.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative overflow-hidden aspect-video bg-gray-800"
                  >
                    <img
                      src={vod.thumbnail}
                      alt={vod.title}
                      className="w-full h-full object-cover group-hover:opacity-75 transition"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/320x180?text=VOD';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </a>

                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-2 line-clamp-2">{vod.title}</h3>
                    <a
                      href={`https://youtube.com/watch?v=${vod.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-red-500 hover:text-red-400 text-sm transition"
                    >
                      Voir sur YouTube
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
              <p className="text-gray-400 mb-4">Aucune VOD ajoutée pour le moment</p>
              <p className="text-gray-500 text-sm">Allez en édition de profil pour ajouter des vidéos YouTube</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-8 justify-center">
          <Link href="/profile">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Éditer le profil
            </Button>
          </Link>
          <Link href="/teams">
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
              Voir les équipes
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
