import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ game: string; puuid: string }> }
) {
  const { game, puuid } = await params;
  const RIOT_API_KEY = 'RGAPI-53a84f11-29d4-44e7-bba6-e00110be4058';

  if (!game || !puuid) {
    return NextResponse.json(
      { error: 'Game and PUUID are required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://europe.api.riotgames.com/riot/account/v1/active-shards/by-game/${encodeURIComponent(game)}/by-puuid/${encodeURIComponent(puuid)}`,
      {
        headers: {
          'X-Riot-Token': RIOT_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.status?.message || 'Failed to fetch active shard data' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching active shard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';