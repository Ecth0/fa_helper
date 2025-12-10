import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");
  const cookieState = request.cookies.get("riot_oauth_state")?.value;

  // Gestion des erreurs d'authentification
  if (error) {
    console.error('Erreur d\'authentification Riot:', error);
    const redirectUrl = new URL('/create-profile', request.url);
    redirectUrl.searchParams.set('error', 'auth_failed');
    return NextResponse.redirect(redirectUrl);
  }

  if (!code || !state) {
    console.error('Code ou state manquant dans la réponse');
    const redirectUrl = new URL('/create-profile', request.url);
    redirectUrl.searchParams.set('error', 'invalid_request');
    return NextResponse.redirect(redirectUrl);
  }

  if (!cookieState || cookieState !== state) {
    console.error('State invalide ou expiré');
    const redirectUrl = new URL('/create-profile', request.url);
    redirectUrl.searchParams.set('error', 'invalid_state');
    return NextResponse.redirect(redirectUrl);
  }

  const clientId = process.env.RIOT_CLIENT_ID;
  const clientSecret = process.env.RIOT_CLIENT_SECRET;
  const redirectUri = process.env.RIOT_REDIRECT_URI;
  const tokenUrl = "https://auth.riotgames.com/token";
  const codeVerifier = request.cookies.get("riot_pkce_verifier")?.value;

  if (!clientId || !clientSecret || !redirectUri) {
    console.error('Configuration OAuth Riot manquante');
    const redirectUrl = new URL('/create-profile', request.url);
    redirectUrl.searchParams.set('error', 'server_error');
    return NextResponse.redirect(redirectUrl);
  }

  if (!codeVerifier) {
    console.error('PKCE verifier manquant');
    const redirectUrl = new URL('/create-profile', request.url);
    redirectUrl.searchParams.set('error', 'server_error');
    return NextResponse.redirect(redirectUrl);
  }

  try {
    // Échanger le code contre un token d'accès
    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Erreur lors de l\'échange de token:', errorText);
      const redirectUrl = new URL('/create-profile', request.url);
      redirectUrl.searchParams.set('error', 'token_exchange_failed');
      return NextResponse.redirect(redirectUrl);
    }

    const tokens = await tokenResponse.json();
    
    // Récupérer les informations du compte utilisateur
    const userInfoResponse = await fetch('https://auth.riotgames.com/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    });

    if (!userInfoResponse.ok) {
      console.error('Erreur lors de la récupération des informations utilisateur');
      const redirectUrl = new URL('/create-profile', request.url);
      redirectUrl.searchParams.set('error', 'user_info_failed');
      return NextResponse.redirect(redirectUrl);
    }

    const userInfo = await userInfoResponse.json();
    
    // ICI: Sauvegarder les informations utilisateur dans votre base de données
    // Exemple: await saveUserToDatabase(userInfo, tokens);

    // Créer une réponse de redirection vers la page de succès
    const response = NextResponse.redirect(new URL('/create-profile/success', request.url));
    
    // Nettoyer les cookies d'authentification
    response.cookies.set("riot_oauth_state", "", { path: "/", maxAge: 0 });
    response.cookies.set("riot_oauth_nonce", "", { path: "/", maxAge: 0 });
    response.cookies.set("riot_pkce_verifier", "", { path: "/", maxAge: 0 });
    
    // Définir un cookie de session sécurisé (auth_session)
    response.cookies.set("auth_session", JSON.stringify({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
      user: {
        puuid: userInfo.sub,
        gameName: userInfo.name,
        tagLine: userInfo.tagline
      }
    }), {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in
    });

    // Définir aussi le cookie fa_helper_session attendu par le front
    response.cookies.set("fa_helper_session", JSON.stringify({
      puuid: userInfo.sub,
      gameName: userInfo.name,
      tagLine: userInfo.tagline
    }), {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}


