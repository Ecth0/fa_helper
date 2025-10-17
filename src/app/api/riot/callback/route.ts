import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const cookieState = request.cookies.get("riot_oauth_state")?.value;

  if (!code || !state) {
    return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
  }

  if (!cookieState || cookieState !== state) {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }

  const clientId = process.env.RIOT_CLIENT_ID;
  const clientSecret = process.env.RIOT_CLIENT_SECRET;
  const redirectUri = process.env.RIOT_REDIRECT_URI;
  const tokenUrl = process.env.RIOT_TOKEN_URL || "https://auth.riotgames.com/token"; // e.g. https://auth.riotgames.com/token
  const codeVerifier = request.cookies.get("riot_pkce_verifier")?.value;

  if (!clientId || !clientSecret || !redirectUri || !tokenUrl) {
    return NextResponse.json({ error: "Riot OAuth not configured" }, { status: 500 });
  }
  if (!codeVerifier) {
    return NextResponse.json({ error: "Missing PKCE verifier" }, { status: 400 });
  }

  try {
    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      const text = await tokenResponse.text();
      return NextResponse.json({ error: "Token exchange failed", details: text }, { status: 502 });
    }

    const tokens = await tokenResponse.json();

    // Clear state cookie
    const response = NextResponse.redirect("/create-profile");
    response.cookies.set("riot_oauth_state", "", { path: "/", maxAge: 0 });
    response.cookies.set("riot_oauth_nonce", "", { path: "/", maxAge: 0 });
    response.cookies.set("riot_pkce_verifier", "", { path: "/", maxAge: 0 });

    // You might want to set a session cookie or store tokens server-side.
    // For demo purposes, we just attach a success flag.
    response.cookies.set("riot_connected", "1", { path: "/", httpOnly: false, maxAge: 60 * 60 });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}


