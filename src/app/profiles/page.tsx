"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useCallback } from 'react';

type Profile = {
  name: string;
  description: string;
  qualities: string[];
  roles: string[];
  vods: Array<{ id: string; title: string }>;
  riot?: {
    iconUrl?: string;
    iconId?: number | string;
    platform?: string;
    rank?: string;
    championMasteries?: any[];
    masteryScore?: number;
    leagueEntries?: any[];
  };
};

export default function ProfilesListPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const example: Profile = {
    name: 'ExemplePlayer',
    description: "Ceci est un profil d'exemple montrant comment fonctionne FA Helper.",
    qualities: ['Communication', 'Macro'],
    roles: ['Mid'],
    vods: [{ id: 'dQw4w9WgXcQ', title: 'Exemple VOD' }],
  };

  const removeUserProfile = () => {
    if (!confirm('Confirmez-vous la suppression de votre profil ? Cette action est irréversible.')) return;

    try {
      // Supprimer le profil principal
      localStorage.removeItem('playerProfile');

      // Mettre à jour la liste playerProfiles si elle existe
      const storedList = localStorage.getItem('playerProfiles');
      if (storedList) {
        try {
          const arr = JSON.parse(storedList);
          // filtrer les profils vides ou anonymes en se basant sur le nom
          const cleaned = Array.isArray(arr) ? arr.filter((p: any) => p && p.name !== (profiles[0]?.name)) : [];
          localStorage.setItem('playerProfiles', JSON.stringify(cleaned));
        } catch (e) {
          console.error('Erreur lors du nettoyage de playerProfiles:', e);
        }
      }

      // Afficher seulement l'exemple après suppression
      setProfiles([example]);
      alert('Profil supprimé avec succès.');
    } catch (err) {
      console.error('Erreur lors de la suppression du profil:', err);
      alert('Une erreur est survenue lors de la suppression.');
    }
  };

  useEffect(() => {
    // Charger le profil utilisateur (playerProfile) et ajouter un profil d'exemple
    const stored = localStorage.getItem('playerProfile');

    const example: Profile = {
      name: 'ExemplePlayer',
      description: "Ceci est un profil d'exemple montrant comment fonctionne FA Helper.",
      qualities: ['Communication', 'Macro'],
      roles: ['Mid'],
      vods: [{ id: 'dQw4w9WgXcQ', title: 'Exemple VOD' }],
    };

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const normalized: Profile = {
          name: parsed.name || 'Profil utilisateur',
          description: parsed.description || '',
          qualities: Array.isArray(parsed.qualities) ? parsed.qualities : [],
          roles: Array.isArray(parsed.roles) ? parsed.roles : [],
          vods: Array.isArray(parsed.vods) ? parsed.vods : [],
          riot: parsed.riot || undefined,
        };
        // Quick correction for known region mismatch for specific users
        if (normalized.name === 'Eclaimania2' && normalized.riot && normalized.riot.platform === 'na1') {
          normalized.riot.platform = 'euw1';
          // persist corrected single profile
          try {
            localStorage.setItem('playerProfile', JSON.stringify(normalized));
          } catch (e) {
            console.warn('Failed to persist corrected platform for Eclaimania2', e);
          }
        }
        // Afficher d'abord le profil de l'utilisateur, puis l'exemple
        setProfiles([normalized, example]);
        return;
      } catch (e) {
        console.error('Erreur parsing playerProfile:', e);
      }
    }

    // Si aucun profil utilisateur, afficher uniquement l'exemple
    setProfiles([example]);
  }, []);

  // Normalize existing playerProfiles in localStorage: inject riot.iconUrl when possible
  useEffect(() => {
    (async () => {
      try {
        const list = localStorage.getItem('playerProfiles');
        if (!list) return;

        const arr = JSON.parse(list);
        if (!Array.isArray(arr) || arr.length === 0) return;

        let changed = false;

        // helper to fetch latest ddragon version
        const getLatestDDragonVersion = async () => {
          try {
            const res = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
            if (!res.ok) return null;
            const versions = await res.json();
            if (Array.isArray(versions) && versions.length > 0) return versions[0];
          } catch (e) {
            console.warn('ddragon version fetch failed', e);
          }
          return null;
        };

        const ddragonVersion = await getLatestDDragonVersion();

        for (let i = 0; i < arr.length; i++) {
          const p = arr[i];
          if (!p || !p.name) continue;

          // skip example/fictitious profiles (by name)
          if (p.name === example.name || p.__example) continue;

          // Quick manual correction for known mismatch: Eclaimania2 should be EUW1
          if (p.name === 'Eclaimania2' && p.riot && p.riot.platform === 'na1') {
            p.riot.platform = 'euw1';
            changed = true;
          }

          // if already has iconUrl, nothing to do
          if (p.riot && p.riot.iconUrl) continue;

          // If we have iconId stored, build url using ddragon
          if (p.riot && (p.riot.iconId || p.riot.iconId === 0)) {
            const iconId = p.riot.iconId;
            if (ddragonVersion) {
              p.riot.iconUrl = `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/profileicon/${iconId}.png`;
              changed = true;
            }
            continue;
          }

          // If platform stored on riot meta, try our summoner API
          if (p.riot && p.riot.platform) {
            try {
              const platform = p.riot.platform.toString();
              const res = await fetch(`/api/riot/summoner/by-name/${encodeURIComponent(platform)}/${encodeURIComponent(p.name)}`);
              if (res.ok) {
                const data = await res.json();
                p.riot = { ...(p.riot || {}), iconUrl: data.iconUrl, iconId: data.iconId };
                changed = true;
              }
            } catch (e) {
              console.warn('failed to fetch summoner for', p.name, e);
            }
          }
        }

        if (changed) {
          localStorage.setItem('playerProfiles', JSON.stringify(arr));
          // refresh state to reflect updates
          setProfiles((prev) => {
            // if prev contains the same entries, prefer updated arr; otherwise keep prev
            try {
              const names = arr.map((x: any) => x.name);
              const newList = prev.map((x: any) => {
                const found = arr.find((a: any) => a.name === x.name);
                return found || x;
              });
              // ensure any new items from arr are included
              arr.forEach((a: any) => {
                if (!newList.find((n: any) => n.name === a.name)) newList.push(a);
              });
              return newList;
            } catch (e) {
              return prev;
            }
          });
        }
      } catch (e) {
        console.error('Normalization error for playerProfiles', e);
      }
    })();
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
              <Button className="bg-blue-600 hover:bg-blue-700">Créer / Éditer mon profil</Button>
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
            {/* Votre profil (si présent) */}
            {profiles[0] && profiles[0].name !== example.name && (
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
                              // eslint-disable-next-line @next/next/no-img-element
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

                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-400">Qualités: {p.qualities.length}</div>
                              <div className="text-sm text-gray-400">VODs: {p.vods.length}</div>
                            </div>

                            <div className="mt-4 flex gap-2">
                              <Link href={`/profiles/${slugify(p.name)}`}>
                                <Button className="bg-blue-600 hover:bg-blue-700">Voir</Button>
                              </Link>
                              <UpdateProfileButton profile={p} onUpdated={(updatedProfile: any) => {
                                // update both state and localStorage
                                try {
                                  // update playerProfile
                                  localStorage.setItem('playerProfile', JSON.stringify(updatedProfile));
                                  // update playerProfiles array
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
                              }} />
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
            {profiles.length > (profiles[0] && profiles[0].name !== example.name ? 1 : 0) && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Autres profils</h2>
                <div className="grid sm:grid-cols-1 lg:grid-cols-1 gap-6">
                  {profiles.slice((profiles[0] && profiles[0].name !== example.name) ? 1 : 0).map((p, idx) => (
                    <div key={`${p.name}-${idx}`} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-24 h-24 bg-gray-800 rounded overflow-hidden flex items-center justify-center">
                          {p.riot?.iconUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
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

                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-400">Qualités: {p.qualities.length}</div>
                            <div className="text-sm text-gray-400">VODs: {p.vods.length}</div>
                          </div>

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

// Small helper component that performs the profile update and renders a button
function UpdateProfileButton({ profile, onUpdated }: { profile: any; onUpdated: (p: any) => void }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const tryUpdate = useCallback(async () => {
    console.log('UpdateProfileButton clicked, profile:', profile);
    if (!profile || !profile.name) {
      console.warn('No profile or no name');
      return;
    }
    setIsUpdating(true);

    let success = false;
    let lastError: any = null;

    console.log('profile.riot:', profile.riot);
    console.log('profile.riot?.summonerId:', profile.riot?.summonerId);
    console.log('profile.riot?.platform:', profile.riot?.platform);

    // ONLY use the stored platform - no fallback to other regions
    if (profile.riot?.summonerId && profile.riot?.platform) {
      try {
        const platform = profile.riot.platform;
        const summonerId = profile.riot.summonerId;
        
        console.log(`Calling /api/riot/summoner/by-id/${platform}/${summonerId}`);
        // Call by-id endpoint ONLY with the stored platform - no by-name, no fallback
        const res = await fetch(`/api/riot/summoner/by-id/${encodeURIComponent(platform)}/${encodeURIComponent(summonerId)}`);
        console.log('Response status:', res.status);
        if (res.ok) {
          const data = await res.json();
          const updated = { ...profile, riot: { ...(profile.riot || {}), iconUrl: data.iconUrl, iconId: data.iconId } };
          onUpdated(updated);
          toast.success('Profil mis à jour avec succès');
          success = true;
        } else {
          lastError = await res.json().catch(() => ({ error: 'unknown' }));
          console.error('API error:', lastError);
        }
      } catch (e) {
        lastError = e;
        console.error('Fetch error:', e);
      }
    } else {
      console.warn('Missing summonerId or platform');
    }

    if (!success) {
      console.warn('Update failed', lastError);
      toast.error('Impossible de mettre à jour le profil. Vérifiez vos données ou essayez plus tard.');
    }

    setIsUpdating(false);
  }, [profile, onUpdated]);

  return (
    <Button onClick={tryUpdate} className="bg-yellow-600 hover:bg-yellow-700" disabled={(isUpdating as boolean)}>
      {(isUpdating as boolean) ? 'Mise à jour...' : 'Mettre à jour'}
    </Button>
  );
}
