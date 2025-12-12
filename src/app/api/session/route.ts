import { NextResponse } from 'next/server';

const COOKIE_NAME = 'fa_helper_session';
const AUTH_COOKIE = 'auth_session';

type SessionData = {
  puuid: string;
  gameName?: string;
  tagLine?: string;
};

function readSession(request: Request): SessionData | null {
  const cookie = request.headers.get('cookie');
  if (!cookie) return null;

  const getCookieVal = (name: string) => {
    const m = cookie.split(';').find((c) => c.trim().startsWith(`${name}=`));
    if (!m) return null;
    return decodeURIComponent(m.trim().split('=')[1] || '');
  };

  // Priorité à auth_session (OAuth Riot)
  const authVal = getCookieVal(AUTH_COOKIE);
  if (authVal) {
    try {
      const parsed = JSON.parse(authVal);
      const user = parsed?.user || {};
      if (user?.puuid) {
        return { puuid: user.puuid, gameName: user.gameName, tagLine: user.tagLine };
      }
    } catch {
      // ignore
    }
  }

  const val = getCookieVal(COOKIE_NAME);
  if (!val) return null;
  try {
    return JSON.parse(val);
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const session = readSession(request);
  if (!session) {
    return NextResponse.json({ session: null });
  }
  return NextResponse.json({ session });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { puuid, gameName, tagLine } = body || {};
    if (!puuid) {
      return NextResponse.json({ error: 'puuid is required' }, { status: 400 });
    }
    const session: SessionData = { puuid, gameName, tagLine };
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, JSON.stringify(session), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 jours
    });
    return res;
  } catch (e) {
    console.error('POST /api/session error', e);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

