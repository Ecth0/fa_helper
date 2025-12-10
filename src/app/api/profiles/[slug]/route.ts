import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'src', 'data', 'profiles.json');

function slugify(s: string) {
  return s
    .toString()
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function readProfiles() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const list = await readProfiles();
  const found = list.find((p: any) => slugify(p?.name || '') === slug);
  if (!found) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
  return NextResponse.json(found);
}

export const dynamic = 'force-dynamic';

