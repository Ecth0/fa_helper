"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import Link from "next/link";

interface RiotProfile {
  gameName: string;
  tagLine: string;
}

export default function CreateProfilePage() {
  const router = useRouter();
  const [gameName, setGameName] = useState('');
  const [tagLine, setTagLine] = useState('');
  const [region, setRegion] = useState('EUW'); // Valeur par défaut
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<RiotProfile | null>(null);
  const [error, setError] = useState('');
  const [existingProfile, setExistingProfile] = useState<any | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!gameName.trim() || !tagLine.trim() || !region.trim()) {
      setError('Veuillez entrer un nom de jeu, un tag et sélectionner une région');
      return;
    }

    setError('');
    // Just set the profile to show confirmation - actual validation happens during creation
    setProfile({ gameName, tagLine });
    toast.success('Informations validées !');
  };

  const handleCreateProfile = () => {
    if (existingProfile) {
      toast.error('Un profil existe déjà. Vous ne pouvez pas en créer un autre.');
      return;
    }
    // Récupérer l'icône summoner via notre API interne
    (async () => {
      try {
        // Map simple region tag to Riot platform routing (e.g. EUW -> euw1)
        const mapTagToPlatform = (tag: string) => {
          const t = (tag || '').toString().trim().toUpperCase();
          const m: Record<string, string> = {
            'EUW': 'euw1',
            'EUNE': 'eun1',
            'NA': 'na1',
            'KR': 'kr',
            'BR': 'br1',
            'OCE': 'oc1',
            'JP': 'jp1',
            'RU': 'ru',
            'LAN': 'la1',
            'LAS': 'la2',
          };
          return m[t] || t.toLowerCase();
        };

        const platform = mapTagToPlatform(region);
        // Use aggregate endpoint with gameName#tagLine format to fetch all summoner data
        const res = await fetch(`/api/riot/aggregate/by-name/${encodeURIComponent(platform)}/${encodeURIComponent(gameName)}%23${encodeURIComponent(tagLine)}`);
        let riotMeta: any = undefined;
        if (res.ok) {
          const data = await res.json();
          console.log('Aggregate response data:', data);
          console.log('data.summoner:', data.summoner);
          console.log('data.summoner?.id:', data.summoner?.id);
          console.log('data.canonicalPlatform:', data.canonicalPlatform);
          
          // Extract highest rank (solo > flex)
          let rank = 'Unranked';
          if (Array.isArray(data.leagueEntries) && data.leagueEntries.length > 0) {
            const solo = data.leagueEntries.find((e: any) => e.queueType === 'RANKED_SOLO_5x5');
            const ranked = solo || data.leagueEntries[0];
            if (ranked) {
              rank = `${ranked.tier || 'Unranked'} ${ranked.rank || ''} ${ranked.leaguePoints || 0} LP`;
            }
          }
          riotMeta = {
            iconUrl: data.summoner ? `https://ddragon.leagueoflegends.com/cdn/12.23.1/img/profileicon/${data.summoner.profileIconId}.png` : undefined,
            iconId: data.summoner?.profileIconId,
            summoner: data.summoner,
            puuid: data.summoner?.puuid,
            summonerId: data.summoner?.id,
            platform: data.canonicalPlatform,
            activeShard: data.activeShard,
            leagueEntries: data.leagueEntries,
            championMasteries: data.championMasteries,
            masteryScore: data.masteryScore,
            recentMatchIds: data.recentMatchIds,
            rank,
          };
          console.log('riotMeta:', riotMeta);
          console.log('riotMeta.summonerId:', riotMeta.summonerId);
          console.log('riotMeta.platform:', riotMeta.platform);
        }

        const profileObj: any = {
          name: gameName,
          riot: riotMeta,
          description: riotMeta?.summoner?.profileIconId ? `Level ${riotMeta.summoner.summonerLevel}` : '',
          qualities: [],
          roles: [],
          vods: [],
        };

        // Save as playerProfile and upsert into playerProfiles
        localStorage.setItem('playerProfile', JSON.stringify(profileObj));
        try {
          const list = localStorage.getItem('playerProfiles');
          const arr = list ? JSON.parse(list) : [];
          const idx = arr.findIndex((p: any) => p.name === profileObj.name);
          if (idx >= 0) arr[idx] = profileObj; else arr.push(profileObj);
          localStorage.setItem('playerProfiles', JSON.stringify(arr));
        } catch (e) {
          console.error('Erreur lors de la mise à jour de playerProfiles', e);
        }

        toast.success('Profil créé avec succès !');
        setTimeout(() => router.push('/profile'), 800);
      } catch (e) {
        console.error('Erreur création profil:', e);
        toast.error('Erreur lors de la création du profil');
      }
    })();
  };

  useEffect(() => {
    const stored = localStorage.getItem('playerProfile');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setExistingProfile(parsed);
      } catch (e) {
        console.error('Erreur parsing existing profile', e);
      }
    }
  }, []);

  const removeExistingProfile = () => {
    if (!confirm('Voulez-vous vraiment supprimer votre profil existant ?')) return;
    try {
      localStorage.removeItem('playerProfile');
      // Also clean playerProfiles entry
      const list = localStorage.getItem('playerProfiles');
      if (list) {
        try {
          const arr = JSON.parse(list);
          const cleaned = Array.isArray(arr) ? arr.filter((p: any) => p && p.name !== existingProfile?.name) : [];
          localStorage.setItem('playerProfiles', JSON.stringify(cleaned));
        } catch (e) {
          console.error('Erreur cleaning playerProfiles', e);
        }
      }
      setExistingProfile(null);
      toast.success('Profil supprimé');
    } catch (e) {
      console.error(e);
      toast.error('Erreur lors de la suppression du profil');
    }
  };
  return (
    <div className="space-y-8">
      {/* Section Vidéo de présentation */}
      <div className="bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">FA Helper, c'est quoi ?</h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Découvrez comment FA Helper peut vous aider à trouver l'équipe parfaite ou le joueur idéal pour vos projets compétitifs.
            </p>
          </div>
          
          {/* Conteneur de la vidéo */}
          <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
            {/* Remplacez cette div par votre lecteur vidéo ou iframe */}
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <p className="text-gray-400">Vidéo de présentation FA Helper</p>
              {/* Exemple avec une vidéo : */}
              {/* <video className="w-full h-full" controls>
                <source src="/videos/fa-helper-presentation.mp4" type="video/mp4" />
                Votre navigateur ne supporte pas la lecture de vidéos.
              </video> */}
            </div>
          </div>
        </div>
      </div>

      {/* Section Création de profil */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 p-6 border border-gray-700 rounded-lg">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Crée ton profil</h2>
              <p className="text-gray-300">
                Rejoins la communauté FA Helper et augmente tes chances de trouver une équipe qui te correspond.
              </p>
            </div>
            
            <div className="space-y-6">
              {existingProfile ? (
                <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
                  <h3 className="text-xl font-semibold text-white mb-4">Vous avez déjà un profil</h3>
                  <p className="text-gray-300 mb-4">Votre profil est déjà créé. Vous pouvez l'éditer ou le supprimer.</p>
                  <div className="flex gap-2">
                    <Link href="/profile">
                      <Button className="bg-blue-600 hover:bg-blue-700">Éditer mon profil</Button>
                    </Link>
                    <Button onClick={removeExistingProfile} className="bg-red-600 hover:bg-red-700">Supprimer mon profil</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">Recherchez votre compte Riot</h3>
                  <p className="text-gray-300">
                    Entrez votre nom de jeu et sélectionnez votre région pour créer votre profil.
                  </p>
                  
                  <div>
                    <label htmlFor="gameName" className="block text-sm font-medium text-gray-300 mb-1">
                      Nom de jeu
                    </label>
                    <Input
                      id="gameName"
                      type="text"
                      value={gameName}
                      onChange={(e) => setGameName(e.target.value)}
                      placeholder="Entrez votre nom de jeu"
                      className="bg-gray-800 border-gray-700 text-white"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="tagLine" className="block text-sm font-medium text-gray-300 mb-1">
                      Tag
                    </label>
                    <Input
                      id="tagLine"
                      type="text"
                      value={tagLine}
                      onChange={(e) => setTagLine(e.target.value)}
                      placeholder="Entrez votre tag (ex: XXXX)"
                      className="bg-gray-800 border-gray-700 text-white"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="region" className="block text-sm font-medium text-gray-300 mb-1">
                      Région
                    </label>
                    <select
                      id="region"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded hover:border-gray-600 focus:border-red-500 focus:outline-none"
                      disabled={isLoading}
                    >
                      <option value="EUW">EUW (Europe Ouest)</option>
                      <option value="EUNE">EUNE (Europe Nord-Est)</option>
                      <option value="NA">NA (Amérique du Nord)</option>
                      <option value="BR">BR (Brésil)</option>
                      <option value="LAN">LAN (Amérique Latine Nord)</option>
                      <option value="LAS">LAS (Amérique Latine Sud)</option>
                      <option value="OCE">OCE (Océanie)</option>
                      <option value="RU">RU (Russie)</option>
                      <option value="KR">KR (Corée)</option>
                      <option value="JP">JP (Japon)</option>
                    </select>
                  </div>
                  
                  <Button
                    onClick={handleSearch}
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={isLoading || !tagLine || !region}
                  >
                    {isLoading ? 'Recherche...' : 'Rechercher'}
                  </Button>
                  
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                </div>
              )}

              {profile && (
                <div className="mt-6 p-6 bg-gray-800 rounded-lg border border-gray-700">
                  <h3 className="text-xl font-semibold text-white mb-4">Profil trouvé</h3>
                  <div className="space-y-3">
                    <p className="text-gray-300">
                      <span className="text-gray-400">Nom de jeu :</span> {profile.gameName}
                    </p>
                    <p className="text-gray-300">
                      <span className="text-gray-400">Tag :</span> {profile.tagLine}
                    </p>
                    <Button 
                      onClick={handleCreateProfile}
                      className="w-full mt-4 bg-green-600 hover:bg-green-700"
                    >
                      Créer mon profil
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400 text-center">
                  En utilisant ce service, vous acceptez les conditions d'utilisation de Riot Games.
                </p>
              </div>
              
              <div className="pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400 text-center">
                  Tu n'as pas de compte Riot ?{' '}
                  <a 
                    href="https://signup.euw.leagueoflegends.com/fr/signup/redownload" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-red-400 hover:underline"
                  >
                    Crée-en un ici
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 border border-gray-700 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-4">Ton profil inclura</h3>
            <ul className="space-y-3">
              {[
                'Statistiques détaillées (soloQ & flex)',
                'Rôles principaux et secondaires',
                'Objectifs compétitifs personnalisés',
                'Liens vers tes meilleures VODs',
                'Références de tes coéquipiers et coachs',
                'Disponibilités pour les entraînements',
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-gray-200">• {item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
