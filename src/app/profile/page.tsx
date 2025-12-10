"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { X, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface VOD {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
}

interface ProfileData {
  name: string;
  description: string;
  qualities: string[];
  roles: string[];
  vods: VOD[];
  riot?: {
    iconUrl?: string;
    iconId?: number | string;
    platform?: string;
    routingRegion?: string;
    puuid?: string;
    summonerId?: string;
    accountId?: string;
    summonerLevel?: number;
    rank?: string;
    soloRank?: string;
    flexRank?: string;
    bestSoloRank?: string;
    bestFlexRank?: string;
    championMasteries?: any[];
    masteryScore?: number;
    leagueEntries?: any[];
    recentMatchIds?: string[];
    recentMatchDetails?: any[];
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    description: '',
    qualities: [],
    roles: [],
    vods: [],
  });

  const [newQuality, setNewQuality] = useState('');
  const [newVodUrl, setNewVodUrl] = useState('');
  const [newVodTitle, setNewVodTitle] = useState('');
  const [isLoadingVod, setIsLoadingVod] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Charger le profil depuis localStorage au montage
  useEffect(() => {
    // Charger session (auth Riot)
    const loadSession = async () => {
      try {
        const res = await fetch('/api/session', { cache: 'no-store' });
        if (res.ok) {
          const js = await res.json();
          if (js?.session?.puuid) {
            setProfile((prev) => ({ ...prev, riot: { ...prev.riot, puuid: js.session.puuid, gameName: js.session.gameName, tagLine: js.session.tagLine } }));
          }
        }
      } catch (e) {
        console.warn('Impossible de récupérer la session', e);
      }
    };
    loadSession();

    const storedProfile = localStorage.getItem('playerProfile');
    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile);
        const normalized: ProfileData = {
          name: parsed.name || '',
          description: parsed.description || '',
          qualities: Array.isArray(parsed.qualities) ? parsed.qualities : [],
          roles: Array.isArray(parsed.roles) ? parsed.roles : [],
          vods: Array.isArray(parsed.vods) ? parsed.vods : [],
          riot: parsed.riot,
        };
        setProfile(normalized);
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
      }
    }
  }, []);

  const ROLES = ['Top', 'Adc', 'Mid', 'Supp', 'Jgl'];

  const toggleRole = (role: string) => {
    if (profile.roles.includes(role)) {
      setProfile({ ...profile, roles: profile.roles.filter(r => r !== role) });
    } else {
      setProfile({ ...profile, roles: [...profile.roles, role] });
    }
  };

  // Extraire l'ID YouTube d'une URL
  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Obtenir la miniature YouTube
  const getYouTubeThumbnail = (videoId: string): string => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  // Ajouter une VOD
  const handleAddVod = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newVodUrl.trim()) {
      toast.error('Veuillez entrer une URL YouTube');
      return;
    }

    const videoId = extractYouTubeId(newVodUrl);
    if (!videoId) {
      toast.error('URL YouTube invalide');
      return;
    }

    setIsLoadingVod(true);

    try {
      const vod: VOD = {
        id: videoId,
        url: newVodUrl,
        title: newVodTitle || `VOD ${profile.vods.length + 1}`,
        thumbnail: getYouTubeThumbnail(videoId),
      };

      setProfile({
        ...profile,
        vods: [...profile.vods, vod],
      });

      setNewVodUrl('');
      setNewVodTitle('');
      toast.success('VOD ajoutée avec succès !');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de la VOD');
    } finally {
      setIsLoadingVod(false);
    }
  };

  // Supprimer une VOD
  const handleRemoveVod = (vodId: string) => {
    setProfile({
      ...profile,
      vods: profile.vods.filter(vod => vod.id !== vodId),
    });
    toast.success('VOD supprimée');
  };

  // Ajouter une qualité
  const handleAddQuality = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newQuality.trim()) {
      return;
    }

    if (profile.qualities.includes(newQuality)) {
      toast.error('Cette qualité est déjà ajoutée');
      return;
    }

    setProfile({
      ...profile,
      qualities: [...profile.qualities, newQuality],
    });
    setNewQuality('');
    toast.success('Qualité ajoutée !');
  };

  // Supprimer une qualité
  const handleRemoveQuality = (quality: string) => {
    setProfile({
      ...profile,
      qualities: profile.qualities.filter(q => q !== quality),
    });
  };

  // Sauvegarder le profil
  const handleSaveProfile = async () => {
    if (!profile.name.trim()) {
      toast.error('Veuillez entrer un nom');
      return;
    }

    setIsSaving(true);
    try {
      // Sauvegarder dans localStorage
      // Conserver les données Riot existantes si elles ne sont pas éditées ici
      const stored = localStorage.getItem('playerProfile');
      let riotMeta = profile.riot;
      if (!riotMeta && stored) {
        try {
          const parsed = JSON.parse(stored);
          riotMeta = parsed.riot || undefined;
        } catch (e) {
          console.error('Impossible de récupérer riotMeta existant', e);
        }
      }

      const toSave = { ...profile, riot: riotMeta };

      // Sauvegarde locale
      localStorage.setItem('playerProfile', JSON.stringify(toSave));

      // Récupérer puuid (session ou riotMeta) pour l'enregistrement serveur
      let puuid = toSave.riot?.puuid;
      if (!puuid) {
        try {
          const sres = await fetch('/api/session', { cache: 'no-store' });
          if (sres.ok) {
            const js = await sres.json();
            puuid = js?.session?.puuid || puuid;
          }
        } catch (e) {
          console.warn('Impossible de récupérer la session', e);
        }
      }

      const toSend = puuid ? { ...toSave, puuid } : toSave;

      // Sauvegarde serveur
      try {
        await fetch('/api/profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toSend),
        });
      } catch (err) {
        console.error('Erreur sauvegarde serveur', err);
      }

      // Cache local playerProfiles
      try {
        const stored = localStorage.getItem('playerProfiles');
        const arr = stored ? JSON.parse(stored) : [];
        const existingIndex = arr.findIndex((p: any) => p.name === profile.name);
        if (existingIndex >= 0) {
          arr[existingIndex] = toSave;
        } else {
          arr.push(toSave);
        }
        localStorage.setItem('playerProfiles', JSON.stringify(arr));
      } catch (err) {
        console.error('Erreur lors de la mise à jour de playerProfiles:', err);
      }
      
      toast.success('Profil sauvegardé avec succès !');
      // Redirection vers la page de visualisation
      setTimeout(() => {
        router.push('/profile/view');
      }, 1000);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la sauvegarde du profil');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* En-tête avec retour */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/create-profile" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-2 transition">
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Link>
            <h1 className="text-4xl font-bold mb-2">Ton Profil de Joueur</h1>
            <p className="text-gray-400">Complète ton profil pour que les équipes puissent mieux te connaître</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Colonne principale - Formulaires */}
          <div className="lg:col-span-2 space-y-8">
            {/* Section Nom et Description */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Informations Générales</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Nom du profil
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Votre nom ou surnom"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    value={profile.description}
                    onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                    placeholder="Parlez de vous, votre expérience, vos objectifs..."
                    className="bg-gray-800 border-gray-700 text-white min-h-32"
                  />
                </div>
              </div>
            </div>

            {/* Section Qualités */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Vos Qualités</h2>

              <div className="space-y-4">
                {/* Ajouter une qualité */}
                <form onSubmit={handleAddQuality} className="flex gap-2">
                  <Input
                    type="text"
                    value={newQuality}
                    onChange={(e) => setNewQuality(e.target.value)}
                    placeholder="Ex: Communication, Leadership, Jeu d'équipe..."
                    className="bg-gray-800 border-gray-700 text-white flex-1"
                  />
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 px-4"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </form>

                {/* Liste des qualités */}
                {profile.qualities.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {profile.qualities.map((quality) => (
                      <div
                        key={quality}
                        className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {quality}
                        <button
                          onClick={() => handleRemoveQuality(quality)}
                          className="ml-1 hover:bg-blue-700 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {profile.qualities.length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-4">Aucune qualité ajoutée</p>
                )}
              </div>
            </div>

            {/* Section Rôles */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Rôles</h2>

              <p className="text-gray-400 mb-4">Sélectionnez les rôles que vous jouez</p>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((role) => (
                  <label key={role} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={profile.roles.includes(role)}
                      onChange={() => toggleRole(role)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <span className="text-gray-300">{role}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Section VODs */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Ajouter vos VODs</h2>

              <form onSubmit={handleAddVod} className="space-y-4 mb-6">
                <div>
                  <label htmlFor="vodTitle" className="block text-sm font-medium text-gray-300 mb-2">
                    Titre de la VOD (conseillé)
                  </label>
                  <Input
                    id="vodTitle"
                    type="text"
                    value={newVodTitle}
                    onChange={(e) => setNewVodTitle(e.target.value)}
                    placeholder="Ex: Mes plus beaux clips"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <label htmlFor="vodUrl" className="block text-sm font-medium text-gray-300 mb-2">
                    Lien YouTube
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="vodUrl"
                      type="text"
                      value={newVodUrl}
                      onChange={(e) => setNewVodUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=... ou ID de vidéo"
                      className="bg-gray-800 border-gray-700 text-white flex-1"
                      disabled={isLoadingVod}
                    />
                    <Button
                      type="submit"
                      className="bg-red-600 hover:bg-red-700"
                      disabled={isLoadingVod}
                    >
                      {isLoadingVod ? 'Ajout...' : 'Ajouter'}
                    </Button>
                  </div>
                </div>
              </form>

              {/* Grille des VODs */}
              {profile.vods.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {profile.vods.map((vod) => (
                    <div key={vod.id} className="group relative">
                      <a
                        href={`https://youtube.com/watch?v=${vod.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block relative overflow-hidden rounded-lg aspect-video bg-gray-800"
                      >
                        <img
                          src={vod.thumbnail}
                          alt={vod.title}
                          className="w-full h-full object-cover group-hover:opacity-75 transition"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </a>
                      <button
                        onClick={() => handleRemoveVod(vod.id)}
                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                      <p className="text-sm text-gray-300 mt-2 truncate">{vod.title}</p>
                    </div>
                  ))}
                </div>
              )}

              {profile.vods.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p>Aucune VOD ajoutée pour le moment</p>
                  <p className="text-sm">Ajoutez des vidéos YouTube pour montrer vos talents !</p>
                </div>
              )}
            </div>
          </div>

          {/* Colonne latérale - Aperçu du profil */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 sticky top-4">
              <h2 className="text-2xl font-bold mb-6">Aperçu du Profil</h2>

              <div className="space-y-6">
                {/* Nom */}
                <div>
                  <p className="text-gray-400 text-sm mb-1">Nom</p>
                  <p className="text-white font-semibold">{profile.name || 'Non défini'}</p>
                </div>

                {/* Description */}
                <div>
                  <p className="text-gray-400 text-sm mb-1">Description</p>
                  <p className="text-gray-300 text-sm line-clamp-3">
                    {profile.description || 'Non définie'}
                  </p>
                </div>

                {/* Infos Riot */}
                {profile.riot && (
                  <div className="space-y-2">
                    <p className="text-gray-400 text-sm mb-1">Données Riot</p>
                    <div className="text-sm text-gray-300 space-y-1">
                      {profile.riot.soloRank && <div>SoloQ: <span className="text-yellow-300">{profile.riot.soloRank}</span></div>}
                      {profile.riot.flexRank && <div>Flex: <span className="text-yellow-300">{profile.riot.flexRank}</span></div>}
                      {!profile.riot.soloRank && profile.riot.rank && <div>Rang: <span className="text-yellow-300">{profile.riot.rank}</span></div>}
                      {profile.riot.bestSoloRank && <div>Meilleur SoloQ: <span className="text-green-300">{profile.riot.bestSoloRank}</span></div>}
                      {profile.riot.bestFlexRank && <div>Meilleur Flex: <span className="text-green-300">{profile.riot.bestFlexRank}</span></div>}
                      {profile.riot.summonerLevel && <div>Niveau: {profile.riot.summonerLevel}</div>}
                    </div>
                    {(profile.riot.bestSoloRank || profile.riot.bestFlexRank) && (
                      <div className="bg-gray-800 border border-gray-700 rounded p-3 space-y-1">
                        <p className="text-gray-300 text-sm font-semibold">Peak Rank</p>
                        {profile.riot.bestSoloRank && (
                          <div className="text-xs text-green-300">SoloQ: {profile.riot.bestSoloRank}</div>
                        )}
                        {profile.riot.bestFlexRank && (
                          <div className="text-xs text-green-300">Flex: {profile.riot.bestFlexRank}</div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Qualités */}
                <div>
                  <p className="text-gray-400 text-sm mb-2">Qualités ({profile.qualities.length})</p>
                  {profile.qualities.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {profile.qualities.slice(0, 5).map((quality) => (
                        <span
                          key={quality}
                          className="bg-blue-600/30 text-blue-300 text-xs px-2 py-1 rounded"
                        >
                          {quality}
                        </span>
                      ))}
                      {profile.qualities.length > 5 && (
                        <span className="text-gray-400 text-xs px-2 py-1">
                          +{profile.qualities.length - 5} de plus
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Aucune qualité ajoutée</p>
                  )}
                </div>

                {/* VODs */}
                <div>
                  <p className="text-gray-400 text-sm mb-2">VODs ({profile.vods.length})</p>
                  <p className="text-gray-500 text-sm">
                    {profile.vods.length > 0
                      ? `${profile.vods.length} vidéo${profile.vods.length > 1 ? 's' : ''}`
                      : 'Aucune VOD'}
                  </p>
                </div>

                {/* Bouton de sauvegarde */}
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="w-full bg-green-600 hover:bg-green-700 mt-4"
                >
                  {isSaving ? 'Sauvegarde...' : 'Sauvegarder le Profil'}
                </Button>

                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
