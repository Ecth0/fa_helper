import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ game: string; puuid: string }> }
) {
  const { game, puuid } = await context.params;
  const RIOT_API_KEY = 'RGAPI-53a84f11-29d4-44e7-bba6-e00110be4058';

  if (!game || !puuid) {
    return NextResponse.json({ error: 'Game and puuid are required' }, { status: 400 });
  }

  try {
    // Use the official 'active-shards' endpoint to get canonical routing/platform info
    const url = `https://europe.api.riotgames.com/riot/account/v1/active-shards/by-game/${encodeURIComponent(
      game
    )}/by-puuid/${encodeURIComponent(puuid)}`;
    const res = await fetch(url, {
      headers: {
        'X-Riot-Token': RIOT_API_KEY,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ error: err?.status?.message || 'Failed to fetch active region' }, { status: res.status });
    }

    const data = await res.json();

    // The API returns an object like: { "puuid": "...", "game": "lol", "platform": "EUW1", "region": "EUROPE" }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching active region info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
