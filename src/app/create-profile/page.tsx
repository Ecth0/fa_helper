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

// Convertit un rang "GOLD I 50 LP" en score pour comparaison (pour suivre le meilleur rang atteint)
const rankToScore = (rankStr?: string | null) => {
  if (!rankStr) return -1;
  const parts = rankStr.split(' ');
  if (parts.length < 2) return -1;
  const tier = parts[0]?.toUpperCase();
  const div = parts[1]?.toUpperCase();
  const tiers = ['IRON','BRONZE','SILVER','GOLD','PLATINUM','EMERALD','DIAMOND','MASTER','GRANDMASTER','CHALLENGER'];
  const tIdx = tiers.indexOf(tier);
  if (tIdx === -1) return -1;
  const divMap: Record<string, number> = { 'I': 3, 'II': 2, 'III': 1, 'IV': 0 };
  const divScore = divMap[div] ?? 0;
  return tIdx * 10 + divScore;
};

const pickBestRank = (prev?: string | null, next?: string | null) => {
  const p = rankToScore(prev);
  const n = rankToScore(next);
  return n > p ? next : prev;
};

export default function CreateProfilePage() {
  const router = useRouter();
  const [gameName, setGameName] = useState('');
  const [tagLine, setTagLine] = useState('');
  const [region, setRegion] = useState('EUW');
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<RiotProfile | null>(null);
  const [error, setError] = useState('');
  const [existingProfile, setExistingProfile] = useState<any | null>(null);
  const [session, setSession] = useState<{ puuid?: string | null }>({ puuid: null });

  // Fonction pour mapper les tags de région vers les plateformes Riot
  const mapTagToPlatform = (tag: string): string => {
    const t = (tag || '').toString().trim().toUpperCase();
    const mapping: Record<string, string> = {
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
      'TR': 'tr1',
    };
    return mapping[t] || t.toLowerCase();
  };

  // Fonction pour mapper les plateformes vers les régions routing
  const mapPlatformToRoutingRegion = (platform: string): string => {
    const p = platform.toLowerCase();
    if (['na1', 'br1', 'la1', 'la2'].includes(p)) return 'americas';
    if (['kr', 'jp1'].includes(p)) return 'asia';
    if (['euw1', 'eun1', 'tr1', 'ru'].includes(p)) return 'europe';
    if (['oc1'].includes(p)) return 'sea';
    return 'americas'; // fallback
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!gameName.trim() || !tagLine.trim() || !region.trim()) {
      setError('Veuillez entrer un nom de jeu, un tag et sélectionner une région');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const platform = mapTagToPlatform(region);
      const routingRegion = mapPlatformToRoutingRegion(platform);
      
      // Étape 1: Récupérer le PUUID via RIOT ID API
      console.log(`Recherche PUUID pour ${gameName}#${tagLine} dans la région ${routingRegion}`);
      
      const accountResponse = await fetch(
        `https://${routingRegion}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
        {
          headers: {
            'X-Riot-Token': process.env.NEXT_PUBLIC_RIOT_API_KEY || ''
          }
        }
      );

      if (!accountResponse.ok) {
        if (accountResponse.status === 404) {
          throw new Error('Compte Riot introuvable. Vérifiez le nom de jeu et le tag.');
        }
        throw new Error(`Erreur API Riot: ${accountResponse.status}`);
      }

      const accountData = await accountResponse.json();
      // Si session déjà connue (auth Riot), prioriser cette puuid pour éviter les collisions
      const puuid = session?.puuid || accountData.puuid;
      
      console.log('PUUID trouvé:', puuid);

      // Étape 2: Récupérer les informations du summoner via PUUID
      const summonerResponse = await fetch(
        `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
        {
          headers: {
            'X-Riot-Token': process.env.NEXT_PUBLIC_RIOT_API_KEY || ''
          }
        }
      );

      if (!summonerResponse.ok) {
        throw new Error('Impossible de récupérer les informations du summoner');
      }

      const summonerData = await summonerResponse.json();
      console.log('Données summoner:', summonerData);

      setProfile({ gameName, tagLine });
      toast.success('Compte Riot trouvé !');
      
    } catch (err: any) {
      console.error('Erreur lors de la recherche:', err);
      setError(err.message || 'Erreur lors de la recherche du compte');
      toast.error(err.message || 'Erreur lors de la recherche');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProfile = async () => {
    if (existingProfile) {
      toast.error('Un profil existe déjà. Vous ne pouvez pas en créer un autre.');
      return;
    }

    setIsLoading(true);
    
    try {
      const platform = mapTagToPlatform(region);
      const routingRegion = mapPlatformToRoutingRegion(platform);
      
      // Étape 1: Récupérer le PUUID
      const accountResponse = await fetch(
        `https://${routingRegion}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
        {
          headers: {
            'X-Riot-Token': process.env.NEXT_PUBLIC_RIOT_API_KEY || ''
          }
        }
      );

      if (!accountResponse.ok) {
        throw new Error('Impossible de récupérer le compte Riot');
      }

      const accountData = await accountResponse.json();
      const puuid = accountData.puuid;

      // Étape 2: Récupérer les informations du summoner
      const summonerResponse = await fetch(
        `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
        {
          headers: {
            'X-Riot-Token': process.env.NEXT_PUBLIC_RIOT_API_KEY || ''
          }
        }
      );

      if (!summonerResponse.ok) {
        throw new Error('Impossible de récupérer les informations du summoner');
      }

      const summonerData = await summonerResponse.json();

      // Étape 3: Récupérer le rang (SoloQ et Flex)
      let rank = 'Unranked';
      let soloRank = 'Unranked';
      let flexRank = 'Unranked';
      try {
        // Utiliser l'API interne (clé serveur) pour éviter les limites côté client
        const aggRes = await fetch(`/api/riot/aggregate/by-name/${platform}/${encodeURIComponent(`${gameName}#${tagLine}`)}`);
        if (aggRes.ok) {
          const agg = await aggRes.json();
          soloRank = agg.soloRank || 'Unranked';
          flexRank = agg.flexRank || 'Unranked';
          rank = agg.rank || soloRank || flexRank || 'Unranked';
        } else {
          console.warn('Aggregate league status', aggRes.status);
        }
      } catch (err) {
        console.warn('Impossible de récupérer le rang via aggregate:', err);
      }

      // Étape 4: Récupérer les masteries (optionnel)
      let championMasteries: any[] = [];
      let masteryScore = 0;
      try {
        const masteryResponse = await fetch(
          `https://${platform}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}`,
          {
            headers: {
              'X-Riot-Token': process.env.NEXT_PUBLIC_RIOT_API_KEY || ''
            }
          }
        );

        if (masteryResponse.ok) {
          championMasteries = await masteryResponse.json();
          
          // Récupérer le score total
          const scoreResponse = await fetch(
            `https://${platform}.api.riotgames.com/lol/champion-mastery/v4/scores/by-puuid/${puuid}`,
            {
              headers: {
                'X-Riot-Token': process.env.NEXT_PUBLIC_RIOT_API_KEY || ''
              }
            }
          );
          
          if (scoreResponse.ok) {
            masteryScore = await scoreResponse.json();
          }
        }
      } catch (err) {
        console.warn('Impossible de récupérer les masteries:', err);
      }

      // Étape 5: Récupérer l'historique de matchs (IDs)
      let recentMatchIds: string[] = [];
      try {
        const matchHistoryResponse = await fetch(
          `https://${routingRegion}.api.riotgames.com/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids?start=0&count=5`,
          {
            headers: {
              'X-Riot-Token': process.env.NEXT_PUBLIC_RIOT_API_KEY || ''
            }
          }
        );
        if (matchHistoryResponse.ok) {
          recentMatchIds = await matchHistoryResponse.json();
        }
      } catch (err) {
        console.warn('Impossible de récupérer l’historique de matchs:', err);
      }

      // Étape 6: Récupérer le détail des matchs (limité aux 5 premiers)
      const matchDetails: any[] = [];
      for (const matchId of recentMatchIds.slice(0, 5)) {
        try {
          const matchRes = await fetch(
            `https://${routingRegion}.api.riotgames.com/lol/match/v5/matches/${encodeURIComponent(matchId)}`,
            {
              headers: {
                'X-Riot-Token': process.env.NEXT_PUBLIC_RIOT_API_KEY || ''
              }
            }
          );
          if (matchRes.ok) {
            const detail = await matchRes.json();
            matchDetails.push(detail);
          }
        } catch (err) {
          console.warn(`Impossible de récupérer le détail du match ${matchId}:`, err);
        }
      }

      // Construire l'objet profil complet
      const previousBestSolo = existingProfile?.riot?.bestSoloRank;
      const previousBestFlex = existingProfile?.riot?.bestFlexRank;
      const bestSoloRank = pickBestRank(previousBestSolo, soloRank);
      const bestFlexRank = pickBestRank(previousBestFlex, flexRank);

      const riotMeta = {
        puuid: puuid,
        summonerId: summonerData.id,
        accountId: summonerData.accountId,
        platform: platform,
        routingRegion: routingRegion,
        iconUrl: `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${summonerData.profileIconId}.png`,
        iconId: summonerData.profileIconId,
        summonerLevel: summonerData.summonerLevel,
        rank: rank,
        soloRank,
        flexRank,
        bestSoloRank,
        bestFlexRank,
        championMasteries: championMasteries.slice(0, 10), // Top 10
        masteryScore: masteryScore,
        recentMatchIds,
        recentMatchDetails: matchDetails,
      };

      const profileObj = {
        puuid,
        name: `${gameName}#${tagLine}`,
        gameName: gameName,
        tagLine: tagLine,
        riot: riotMeta,
        description: `Level ${summonerData.summonerLevel} - ${rank}`,
        qualities: [],
        roles: [],
        vods: [],
      };

      console.log('Profil créé:', profileObj);

      // Sauvegarder le profil local + session + serveur
      localStorage.setItem('playerProfile', JSON.stringify(profileObj));
      try {
        await fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ puuid, gameName, tagLine }),
        });
      } catch (err) {
        console.warn('Impossible de sauvegarder la session', err);
      }
      try {
        await fetch('/api/profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileObj),
        });
      } catch (err) {
        console.warn('Impossible de sauvegarder le profil sur le serveur', err);
      }
      
      // Ajouter à la liste des profils
      try {
        const list = localStorage.getItem('playerProfiles');
        const arr = list ? JSON.parse(list) : [];
        const idx = arr.findIndex((p: any) => p.name === profileObj.name);
        if (idx >= 0) {
          arr[idx] = profileObj;
        } else {
          arr.push(profileObj);
        }
        localStorage.setItem('playerProfiles', JSON.stringify(arr));
      } catch (e) {
        console.error('Erreur lors de la mise à jour de playerProfiles', e);
      }

      toast.success('Profil créé avec succès !');
      setTimeout(() => router.push('/profile'), 800);
      
    } catch (err: any) {
      console.error('Erreur création profil:', err);
      toast.error(err.message || 'Erreur lors de la création du profil');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // récupérer session (auth Riot)
    const loadSession = async () => {
      try {
        const res = await fetch('/api/session', { cache: 'no-store' });
        if (res.ok) {
          const js = await res.json();
          if (js?.session) setSession(js.session);
        }
      } catch (e) {
        console.warn('Impossible de récupérer la session', e);
      }
    };
    loadSession();

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
          
          <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <p className="text-gray-400">Vidéo de présentation FA Helper</p>
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
                      placeholder="Entrez votre tag (ex: EUW)"
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
                      <option value="TR">TR (Turquie)</option>
                    </select>
                  </div>
                  
                  <Button
                    onClick={handleSearch}
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={isLoading || !gameName || !tagLine || !region}
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
                      disabled={isLoading}
                    >
                      {isLoading ? 'Création...' : 'Créer mon profil'}
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