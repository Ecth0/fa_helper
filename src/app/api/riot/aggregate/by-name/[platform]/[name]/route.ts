import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// Aggregates useful Riot info for a player using gameName + tagLine + platform
export async function GET(
  request: NextRequest,
  { params }: { params: { platform: string; name: string } }
) {
  const { platform, name } = params;
  const RIOT_API_KEY = 'RGAPI-53a84f11-29d4-44e7-bba6-e00110be4058';

  if (!platform || !name) {
    return NextResponse.json({ error: 'Platform and name required' }, { status: 400 });
  }

  try {
    // Parse name as "gameName#tagLine" if it contains #, otherwise just gameName
    let gameName = name;
    let tagLine = '';
    
    if (name.includes('#')) {
      const parts = name.split('#');
      gameName = parts[0];
      tagLine = parts[1];
    }

    // 1) Account lookup by Riot ID (gameName + tagLine) to get PUUID
    // Use europe region for routing (valid for all regions)
    const accountRes = await fetch(
      `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
      { headers: { 'X-Riot-Token': RIOT_API_KEY } }
    );
    if (!accountRes.ok) {
      const err = await accountRes.json().catch(() => ({}));
      return NextResponse.json({ error: err?.status?.message || 'Account not found' }, { status: accountRes.status });
    }
    const account = await accountRes.json();
    const puuid = account.puuid;

    // 2) Get summoner by PUUID using the provided platform
    let summoner: any = null;
    try {
      const summonerRes = await fetch(
        `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(puuid)}`,
        { headers: { 'X-Riot-Token': RIOT_API_KEY } }
      );
      if (summonerRes.ok) {
        summoner = await summonerRes.json();
      }
    } catch (e) {
      console.warn('Summoner lookup by PUUID failed', e);
    }

    const summonerId = summoner?.id;
    let activeShard: any = null;
    try {
      const shardRes = await fetch(
        `https://europe.api.riotgames.com/riot/account/v1/active-shards/by-game/lol/by-puuid/${encodeURIComponent(puuid)}`,
        { headers: { 'X-Riot-Token': RIOT_API_KEY } }
      );
      if (shardRes.ok) activeShard = await shardRes.json();
    } catch (e) {
      console.warn('active-shards lookup failed', e);
    }

    // Use the provided platform for all subsequent calls
    const canonicalPlatform = platform;

    // 3) league entries
    let leagueEntries: any[] = [];
    let soloRank: string | null = null;
    let flexRank: string | null = null;
    let rank: string | null = null;
    try {
      const leagueRes = await fetch(
        `https://${canonicalPlatform}.api.riotgames.com/lol/league/v4/entries/by-summoner/${encodeURIComponent(summonerId)}`,
        { headers: { 'X-Riot-Token': RIOT_API_KEY } }
      );
      if (leagueRes.ok) leagueEntries = await leagueRes.json();

      const soloQueue = leagueEntries.find((entry: any) => entry.queueType === 'RANKED_SOLO_5x5');
      const flexQueue = leagueEntries.find((entry: any) => entry.queueType === 'RANKED_FLEX_SR');
      const anyQueue = leagueEntries[0];
      const formatRank = (entry: any) => `${entry.tier} ${entry.rank} ${entry.leaguePoints} LP`;
      if (soloQueue) soloRank = formatRank(soloQueue);
      if (flexQueue) flexRank = formatRank(flexQueue);
      const selected = soloQueue || flexQueue || anyQueue;
      if (selected) rank = formatRank(selected);
    } catch (e) {
      console.warn('league entries lookup failed', e);
    }

    // 4) champion masteries (all)
    let championMasteries: any[] = [];
    try {
      const cmRes = await fetch(
        `https://${canonicalPlatform}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${encodeURIComponent(summonerId)}`,
        { headers: { 'X-Riot-Token': RIOT_API_KEY } }
      );
      if (cmRes.ok) {
        const all = await cmRes.json();
        if (Array.isArray(all)) championMasteries = all;
      }
    } catch (e) {
      console.warn('champion mastery lookup failed', e);
    }

    // 4.5) mastery score (total mastery points)
    let masteryScore = 0;
    try {
      const scoreRes = await fetch(
        `https://${canonicalPlatform}.api.riotgames.com/lol/champion-mastery/v4/scores/by-summoner/${encodeURIComponent(summonerId)}`,
        { headers: { 'X-Riot-Token': RIOT_API_KEY } }
      );
      if (scoreRes.ok) {
        masteryScore = await scoreRes.json();
      }
    } catch (e) {
      console.warn('mastery score lookup failed', e);
    }

    // 5) recent match ids via match-v5: need regional routing (use activeShard.region if present)
    let recentMatchIds: string[] = [];
    try {
      const regionHost = (activeShard?.region || 'europe').toString().toLowerCase();
      const matchHost = regionHost; // e.g. 'europe', 'americas', 'asia'
      const matchRes = await fetch(
        `https://${matchHost}.api.riotgames.com/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}?start=0&count=5`,
        { headers: { 'X-Riot-Token': RIOT_API_KEY } }
      );
      if (matchRes.ok) recentMatchIds = await matchRes.json();
    } catch (e) {
      console.warn('match ids lookup failed', e);
    }

    const aggregated = {
      summoner,
      activeShard,
      canonicalPlatform,
      leagueEntries,
      rank,
      soloRank,
      flexRank,
      championMasteries,
      masteryScore,
      recentMatchIds,
    };

    return NextResponse.json(aggregated);
  } catch (error) {
    console.error('Aggregate error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
