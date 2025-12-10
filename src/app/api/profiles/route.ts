import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'src', 'data', 'profiles.json');

async function ensureFile() {
  try {
    await fs.access(DATA_PATH);
  } catch {
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    await fs.writeFile(DATA_PATH, '[]', 'utf-8');
  }
}

async function readProfiles() {
  await ensureFile();
  const raw = await fs.readFile(DATA_PATH, 'utf-8');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeProfiles(list: any[]) {
  await fs.writeFile(DATA_PATH, JSON.stringify(list, null, 2), 'utf-8');
}

export async function GET() {
  const list = await readProfiles();
  // Alléger la charge pour l'affichage liste : ne renvoyer que des métadonnées légères
  const trimmed = list.map((p: any) => {
    const lightDetails = Array.isArray(p?.riot?.recentMatchDetails)
      ? p.riot.recentMatchDetails.slice(0, 2).map((m: any) => ({
          metadata: { matchId: m?.metadata?.matchId },
          info: m?.info
            ? {
                gameMode: m.info.gameMode,
                gameDuration: m.info.gameDuration,
              }
            : undefined,
        }))
      : undefined;
    return {
      ...p,
      riot: p.riot
        ? {
            ...p.riot,
            recentMatchDetails: lightDetails,
            championMasteries: undefined,
          }
        : undefined,
    };
  });
  return NextResponse.json(trimmed);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || !body.puuid) {
      return NextResponse.json({ error: 'puuid is required' }, { status: 400 });
    }
    const list = await readProfiles();
    const idx = list.findIndex((p: any) => p?.puuid === body.puuid);
    if (idx >= 0) {
      list[idx] = body;
    } else {
      list.push(body);
    }
    await writeProfiles(list);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('POST /api/profiles error', e);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

