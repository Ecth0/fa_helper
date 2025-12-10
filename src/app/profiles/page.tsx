"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useCallback } from 'react';

type Profile = {
  name: string;
  gameName?: string;
  tagLine?: string;
  description: string;
  qualities: string[];
  roles: string[];
  vods: Array<{ id: string; title: string }>;
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
};

export default function ProfilesListPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [session, setSession] = useState<{ puuid?: string | null }>({ puuid: null });



  const removeUserProfile = () => {
    if (!confirm('Confirmez-vous la suppression de votre profil ? Cette action est irréversible.')) return;

    try {
      localStorage.removeItem('playerProfile');

      const storedList = localStorage.getItem('playerProfiles');
      if (storedList) {
        try {
          const arr = JSON.parse(storedList);
          const cleaned = Array.isArray(arr) ? arr.filter((p: any) => p && p.name !== profiles[0]?.name) : [];
          localStorage.setItem('playerProfiles', JSON.stringify(cleaned));
        } catch (e) {
          console.error('Erreur lors du nettoyage de playerProfiles:', e);
        }
      }

      setProfiles([]);
      alert('Profil supprimé avec succès.');
    } catch (err) {
      console.error('Erreur lors de la suppression du profil:', err);
      alert('Une erreur est survenue lors de la suppression.');
    }
  };

  useEffect(() => {
    const example: Profile = {
      name: 'ExemplePlayer',
      description: "Ceci est un profil d'exemple montrant comment fonctionne FA Helper.",
      qualities: ['Communication', 'Macro'],
      roles: ['Mid'],
      vods: [{ id: 'dQw4w9WgXcQ', title: 'Exemple VOD' }],
    };

    const load = async () => {
      let currentSession: { puuid?: string | null } = { puuid: null };

      // Récupérer la session (puuid) pour identifier "Mon profil"
      try {
        const sres = await fetch('/api/session', { cache: 'no-store' });
        if (sres.ok) {
          const js = await sres.json();
          if (js?.session) {
            currentSession = js.session;
            setSession(js.session);
          }
        }
      } catch (e) {
        console.warn('Fetch /api/session failed', e);
      }

      try {
        const res = await fetch('/api/profiles', { cache: 'no-store' });
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && list.length > 0) {
            if (currentSession?.puuid) {
              const mineIdx = list.findIndex((p: any) => p?.puuid === currentSession.puuid);
              if (mineIdx >= 0) {
                const mine = list[mineIdx];
                const rest = list.filter((_: any, idx: number) => idx !== mineIdx);
                setProfiles([mine, ...rest, example]);
                return;
              }
            }
            setProfiles([...list, example]);
            return;
          }
        }
      } catch (e) {
        console.warn('Fetch /api/profiles failed, fallback localStorage', e);
      }

      const stored = localStorage.getItem('playerProfile');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const normalized: Profile = {
            name: parsed.name || 'Profil utilisateur',
            gameName: parsed.gameName,
            tagLine: parsed.tagLine,
            description: parsed.description || '',
            qualities: Array.isArray(parsed.qualities) ? parsed.qualities : [],
            roles: Array.isArray(parsed.roles) ? parsed.roles : [],
            vods: Array.isArray(parsed.vods) ? parsed.vods : [],
            riot: parsed.riot || undefined,
          };
          setProfiles([normalized, example]);
          return;
        } catch (e) {
          console.error('Erreur parsing playerProfile:', e);
        }
      }

      setProfiles([example]);
    };

    load();
  }, []);

  const slugify = (s: string) =>
    s
      .toString()
      .normalize('NFKD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  return (
    <div className="min-h-screen bg-gray-950 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Mon Profil</h1>
          <div className="flex gap-2">
            <Link href="/profile">
              <Button className="bg-blue">Éditer mon profil</Button>
            </Link>
          </div>
        </div>

        {profiles.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400 mb-4">Aucun profil utilisateur trouvé. Créez votre profil.</p>
            <Link href="/create-profile">
              <Button className="bg-red-600 hover:bg-red-700">Créer mon profil</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Votre profil */}
            {session?.puuid && profiles[0] && profiles[0].riot?.puuid === session.puuid && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Votre profil</h2>
                <div className="grid sm:grid-cols-1 lg:grid-cols-1 gap-6">
                  {(() => {
                    const p = profiles[0];

                    return (
                      <div key={`${p.name}-you`} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-24 h-24 bg-gray-800 rounded overflow-hidden flex items-center justify-center">
                            {p.riot?.iconUrl ? (
                              <img src={p.riot.iconUrl} alt={`${p.name} avatar`} className="w-full h-full object-cover" />
                            ) : (
                              <div className="text-gray-500">No avatar</div>
                            )}
                          </div>

                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">{p.name}</h3>
                            {p.riot?.rank && <p className="text-yellow-400 text-sm font-semibold mb-2">{p.riot.rank}</p>}
                            {p.riot?.summonerLevel && <p className="text-gray-400 text-sm mb-2">Level {p.riot.summonerLevel}</p>}
                            <p className="text-gray-400 text-sm mb-2">{p.description}</p>

                            <div className="flex gap-2 flex-wrap mb-3">
                              {p.roles.map((r: string) => (
                                <span key={r} className="text-xs px-2 py-1 bg-green-600/20 text-green-300 rounded">{r}</span>
                              ))}
                            </div>

                            {p.qualities?.length > 0 && (
                              <div className="flex gap-2 flex-wrap mb-3">
                                {p.qualities.map((q: string) => (
                                  <span key={q} className="text-xs px-2 py-1 bg-blue-600/20 text-blue-300 rounded">{q}</span>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between mb-3">
                              <div className="text-sm text-gray-400">VODs: {p.vods.length}</div>
                            </div>

                            <div className="mt-4 flex gap-2">
                              <Link href={`/profiles/${slugify(p.name)}`}>
                                <Button className="bg-blue-600 hover:bg-blue-700">Voir</Button>
                              </Link>
                              <UpdateProfileButton 
                                profile={p} 
                                onUpdated={(updatedProfile: any) => {
                                  try {
                                    localStorage.setItem('playerProfile', JSON.stringify(updatedProfile));
                                    const list = localStorage.getItem('playerProfiles');
                                    const arr = list ? JSON.parse(list) : [];
                                    const idx = arr.findIndex((x: any) => x.name === updatedProfile.name);
                                    if (idx >= 0) arr[idx] = updatedProfile; else arr.push(updatedProfile);
                                    localStorage.setItem('playerProfiles', JSON.stringify(arr));
                                  } catch (e) {
                                    console.error('Error saving updated profile', e);
                                  }

                                  setProfiles((prev) => {
                                    const copy = [...prev];
                                    copy[0] = updatedProfile;
                                    return copy;
                                  });
                                }} 
                              />
                              <Button onClick={removeUserProfile} className="bg-red-600 hover:bg-red-700">
                                Supprimer
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Autres profils */}
            {profiles.length > (session?.puuid && profiles[0]?.riot?.puuid === session.puuid ? 1 : 0) && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Autres profils</h2>
                <div className="grid sm:grid-cols-1 lg:grid-cols-1 gap-6">
                  {profiles.slice((session?.puuid && profiles[0]?.riot?.puuid === session.puuid) ? 1 : 0).map((p, idx) => (
                    <div key={`${p.name}-${idx}`} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-24 h-24 bg-gray-800 rounded overflow-hidden flex items-center justify-center">
                          {p.riot?.iconUrl ? (
                            <img src={p.riot.iconUrl} alt={`${p.name} avatar`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-gray-500">No avatar</div>
                          )}
                        </div>

                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">{p.name}</h3>
                          {p.riot?.rank && <p className="text-yellow-400 text-sm font-semibold mb-2">{p.riot.rank}</p>}
                          <p className="text-gray-400 text-sm mb-2">{p.description}</p>

                          <div className="flex gap-2 flex-wrap mb-3">
                            {p.roles.map((r: string) => (
                              <span key={r} className="text-xs px-2 py-1 bg-green-600/20 text-green-300 rounded">{r}</span>
                            ))}
                          </div>

                          {p.qualities?.length > 0 && (
                            <div className="flex gap-2 flex-wrap mb-3">
                              {p.qualities.map((q: string) => (
                                <span key={q} className="text-xs px-2 py-1 bg-blue-600/20 text-blue-300 rounded">{q}</span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-400">VODs: {p.vods.length}</div>
                          </div>

                          {p.riot && (p.riot.bestSoloRank || p.riot.bestFlexRank) && (
                            <div className="mt-3 bg-gray-800 border border-gray-700 rounded p-3 text-xs text-gray-200 space-y-1">
                              <div className="text-gray-300 font-semibold">Peak Rank</div>
                              {p.riot.bestSoloRank && <div>SoloQ: <span className="text-green-300">{p.riot.bestSoloRank}</span></div>}
                              {p.riot.bestFlexRank && <div>Flex: <span className="text-green-300">{p.riot.bestFlexRank}</span></div>}
                            </div>
                          )}

                          <div className="mt-4 flex gap-2">
                            <Link href={`/profiles/${slugify(p.name)}`}>
                              <Button className="bg-blue-600 hover:bg-blue-700">Voir</Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function UpdateProfileButton({ profile, onUpdated }: { profile: any; onUpdated: (p: any) => void }) {
  const [isUpdating, setIsUpdating] = useState(false);

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

  const tryUpdate = useCallback(async () => {
    console.log('UpdateProfileButton clicked, profile:', profile);
    
    if (!profile || !profile.riot) {
      console.warn('No profile or no riot data');
      toast.error('Impossible de mettre à jour : données Riot manquantes');
      return;
    }

    const { puuid, platform, routingRegion, gameName, tagLine } = profile.riot;

    if (!puuid || !platform) {
      console.warn('Missing PUUID or platform');
      toast.error('Impossible de mettre à jour : PUUID ou plateforme manquant');
      return;
    }

    // Fallback si gameName / tagLine absents dans riot: essayer de les dériver du nom
    let effectiveGameName = gameName;
    let effectiveTagLine = tagLine;
    if ((!effectiveGameName || !effectiveTagLine) && profile.name?.includes('#')) {
      const parts = profile.name.split('#');
      effectiveGameName = effectiveGameName || parts[0];
      effectiveTagLine = effectiveTagLine || parts[1];
    }
    if (!effectiveGameName || !effectiveTagLine) {
      console.warn('Missing gameName or tagLine for aggregate call');
      toast.error('Impossible de mettre à jour : gameName ou tagLine manquant');
      return;
    }

    setIsUpdating(true);

    try {
      // Étape 1: Récupérer les nouvelles données du summoner
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

      // Étape 2: Récupérer le rang (SoloQ + Flex)
      let rank = 'Unranked';
      let soloRank = 'Unranked';
      let flexRank = 'Unranked';
      try {
        const aggRes = await fetch(`/api/riot/aggregate/by-name/${platform}/${encodeURIComponent(`${effectiveGameName}#${effectiveTagLine}`)}`);
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

      // Étape 3: Récupérer les masteries
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

      // Mettre à jour le profil
      const prevBestSolo = profile.riot?.bestSoloRank;
      const prevBestFlex = profile.riot?.bestFlexRank;
      const bestSoloRank = pickBestRank(prevBestSolo, soloRank);
      const bestFlexRank = pickBestRank(prevBestFlex, flexRank);

      const updatedRiot = {
        ...profile.riot,
        iconUrl: `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${summonerData.profileIconId}.png`,
        iconId: summonerData.profileIconId,
        summonerLevel: summonerData.summonerLevel,
        rank: rank,
        soloRank,
        flexRank,
        bestSoloRank,
        bestFlexRank,
        championMasteries: championMasteries.slice(0, 10),
        masteryScore: masteryScore,
        summonerId: summonerData.id,
        accountId: summonerData.accountId,
      };

      const updatedProfile = {
        ...profile,
        riot: updatedRiot,
        description: `Level ${summonerData.summonerLevel} - ${rank}`,
      };

      onUpdated(updatedProfile);
      toast.success('Profil mis à jour avec succès');
    } catch (err: any) {
      console.error('Update error:', err);
      toast.error(err.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setIsUpdating(false);
    }
  }, [profile, onUpdated]);

  return (
    <Button 
      onClick={tryUpdate} 
      className="bg-yellow-600 hover:bg-yellow-700" 
      disabled={isUpdating}
    >
      {isUpdating ? 'Mise à jour...' : 'Mettre à jour'}
    </Button>
  );
}