import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { platform: string; name: string } }
) {
  const { platform, name } = await params as { platform: string; name: string };
  const RIOT_API_KEY = 'RGAPI-53a84f11-29d4-44e7-bba6-e00110be4058';

  if (!platform || !name) {
    return NextResponse.json({ error: 'Platform and name are required' }, { status: 400 });
  }

  try {
    // Call Summoner API to get profileIconId
    const summonerRes = await fetch(
      `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(name)}`,
      {
        headers: {
          'X-Riot-Token': RIOT_API_KEY,
        },
      }
    );

    if (!summonerRes.ok) {
      const err = await summonerRes.json().catch(() => ({}));
      return NextResponse.json({ error: err?.status?.message || 'Failed to fetch summoner' }, { status: summonerRes.status });
    }

    const summoner = await summonerRes.json();
    const iconId = summoner.profileIconId;

    // Retrieve latest Data Dragon version
    let version = '13.1.1';
    try {
      const versionsRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
      if (versionsRes.ok) {
        const versions = await versionsRes.json();
        if (Array.isArray(versions) && versions.length > 0) version = versions[0];
      }
    } catch (e) {
      console.warn('Failed to fetch ddragon versions, falling back to', version);
    }

    const iconUrl = `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${iconId}.png`;

    return NextResponse.json({ iconUrl, iconId, summoner });
  } catch (error) {
    console.error('Error fetching summoner icon:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
