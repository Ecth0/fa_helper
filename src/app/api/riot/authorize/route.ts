import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function generateRandomString(length: number = 32): string {
  return crypto.randomBytes(Math.ceil(length * 0.75)).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "").slice(0, length);
}

function base64UrlEncode(input: Buffer): string {
  return input.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function sha256(input: string): string {
  const digest = crypto.createHash("sha256").update(input).digest();
  return base64UrlEncode(digest);
}

export async function GET(request: NextRequest) {
  const clientId = process.env.RIOT_CLIENT_ID;
  const redirectUri = process.env.RIOT_REDIRECT_URI; // e.g. https://yourapp.com/api/riot/callback
  const authorizeUrl = process.env.RIOT_AUTH_URL || "https://auth.riotgames.com/authorize";

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: "Riot OAuth not configured" }, { status: 500 });
  }

  const state = generateRandomString(32);
  const nonce = generateRandomString(32);
  const codeVerifier = generateRandomString(64);
  const codeChallenge = sha256(codeVerifier);

  const url = new URL(authorizeUrl);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid offline_access");
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("prompt", "consent");

  // If debug=1, return the built URL/params for troubleshooting instead of redirecting
  if (request.nextUrl.searchParams.get("debug") === "1") {
    return NextResponse.json({
      authorizeUrl: url.toString(),
      usedParams: {
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid offline_access",
        state,
        nonce,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        prompt: "consent",
      },
    });
  }

  const response = NextResponse.redirect(url.toString());
  response.cookies.set("riot_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });
  response.cookies.set("riot_oauth_nonce", nonce, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });
  response.cookies.set("riot_pkce_verifier", codeVerifier, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });
  return response;
}


