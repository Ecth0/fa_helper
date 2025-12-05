"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExternalLink, ArrowLeft } from 'lucide-react';

type VOD = { id: string; title?: string; thumbnail?: string };
type Profile = {
  name: string;
  description: string;
  qualities: string[];
  roles: string[];
  vods: VOD[];
};

function slugify(s: string) {
  return s
    .toString()
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function ProfileBySlugPage({ params }: { params: { slug: string } }) {
  // Next.js may provide `params` as a Promise in newer versions.
  // Prefer unwrapping with `React.use()` when available, otherwise fall back to direct access.
  // This avoids the runtime warning about accessing `params.slug` directly.
  const resolvedParams = (React as any).use ? (React as any).use(params) : params;
  const { slug } = resolvedParams as { slug: string };
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user profile from localStorage
    const stored = localStorage.getItem('playerProfile');

    const example: Profile = {
      name: 'ExemplePlayer',
      description: "Ceci est un profil d'exemple montrant comment fonctionne FA Helper.",
      qualities: ['Communication', 'Macro'],
      roles: ['Mid'],
      vods: [{ id: 'dQw4w9WgXcQ', title: 'Exemple VOD', thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg` }],
    };

    try {
      if (stored) {
        const parsed = JSON.parse(stored);
        const normalized: Profile = {
          name: parsed.name || 'Profil utilisateur',
          description: parsed.description || '',
          qualities: Array.isArray(parsed.qualities) ? parsed.qualities : [],
          roles: Array.isArray(parsed.roles) ? parsed.roles : [],
          vods: Array.isArray(parsed.vods) ? parsed.vods.map((v: any) => ({ id: v.id, title: v.title, thumbnail: v.thumbnail || (`https://img.youtube.com/vi/${v.id}/maxresdefault.jpg`) })) : [],
        };

        if (slug === slugify(normalized.name)) {
          setProfile(normalized);
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error('Erreur lors du parsing du profil utilisateur', e);
    }

    // If not matched to user, check example
    if (slug === slugify(example.name)) {
      setProfile(example);
    } else {
      setProfile(null);
    }
    setIsLoading(false);
  }, [slug]);

  if (isLoading) return (<div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Chargement...</div>);

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-950 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Profil introuvable</h1>
          <p className="text-gray-400 mb-8">Le profil demandé n'existe pas.</p>
          <Link href="/profiles">
            <Button className="bg-blue-600 hover:bg-blue-700">Retour aux profils</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/profiles" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>

        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-gray-800 rounded-lg p-8 mb-8">
          <h1 className="text-4xl font-bold mb-2">{profile.name}</h1>
          <p className="text-gray-400 mb-6">{profile.description || 'Aucune description'}</p>

          {profile.roles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {profile.roles.map((role) => (
                <span key={role} className="bg-green-600/20 border border-green-600/50 text-green-300 px-3 py-1 rounded-full text-sm">{role}</span>
              ))}
            </div>
          )}

          {profile.qualities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {profile.qualities.map((q) => (
                <span key={q} className="bg-blue-600/20 border border-blue-600/50 text-blue-300 px-4 py-2 rounded-full text-sm">{q}</span>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-6">VODs</h2>
          {profile.vods.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-6">
              {profile.vods.map(v => (
                <div key={v.id} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                  <a href={`https://youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer" className="block aspect-video">
                    <img src={v.thumbnail || `https://img.youtube.com/vi/${v.id}/maxresdefault.jpg`} alt={v.title || 'VOD'} className="w-full h-full object-cover" />
                  </a>
                  <div className="p-4">
                    <h3 className="font-semibold">{v.title || 'VOD'}</h3>
                    <a className="text-red-500 inline-flex items-center gap-2 mt-2" href={`https://youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer">Voir sur YouTube <ExternalLink className="w-4 h-4" /></a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-400">Aucune VOD</p>
            </div>
          )}
        </div>

        <div className="mt-8 flex gap-2">
          <Link href="/profiles">
            <Button variant="outline" className="border-gray-700 text-gray-300">Retour</Button>
          </Link>
          {slug === slugify((localStorage.getItem('playerProfile') ? JSON.parse(localStorage.getItem('playerProfile')!).name : '')) && (
            <Link href="/profile">
              <Button className="bg-green-600 hover:bg-green-700">Éditer mon profil</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
