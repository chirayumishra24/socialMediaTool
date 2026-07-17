/**
 * Skilizee — Meta OAuth 2.0 & Token Management
 *
 * Handles the full OAuth lifecycle:
 * 1. Exchange authorization code for short-lived token
 * 2. Exchange short-lived → long-lived token (60 days)
 * 3. Refresh long-lived tokens before expiry
 * 4. Store/retrieve tokens from Firestore
 * 5. Auto-discover connected IG accounts and FB Pages
 */

import { getMetaConfig, buildGraphUrl, GRAPH_API_BASE } from "./meta-config";

// ─── Token Storage (Firestore or in-memory fallback) ───────────

let firestoreDb = null;
const TOKENS_COLLECTION = "meta_tokens";
const TOKEN_DOC_ID = "primary"; // single-account MVP

// In-memory fallback when Firestore is unavailable
let memoryTokenStore = null;

async function getFirestore() {
  if (firestoreDb) return firestoreDb;

  try {
    const { getApps, getApp, initializeApp, cert } = await import("firebase-admin/app");
    const { getFirestore: getFs } = await import("firebase-admin/firestore");

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) return null;

    const apps = getApps();
    const app = apps.length > 0 ? getApp() : initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });

    firestoreDb = getFs(app);
    return firestoreDb;
  } catch {
    return null;
  }
}

// ─── Token CRUD ────────────────────────────────────────────────

/**
 * Save token data to Firestore (or memory fallback).
 */
export async function saveTokenData(tokenData) {
  const data = {
    ...tokenData,
    updatedAt: new Date().toISOString(),
  };

  const db = await getFirestore();
  if (db) {
    try {
      await db.collection(TOKENS_COLLECTION).doc(TOKEN_DOC_ID).set(data, { merge: true });
      console.log("[Meta Auth] Token saved to Firestore");
      return data;
    } catch (err) {
      console.error("[Meta Auth] Firestore save failed:", err.message);
    }
  }

  // Memory fallback
  memoryTokenStore = data;
  console.log("[Meta Auth] Token saved to memory (Firestore unavailable)");
  return data;
}

/**
 * Retrieve stored token data.
 */
export async function getTokenData() {
  const db = await getFirestore();
  if (db) {
    try {
      const doc = await db.collection(TOKENS_COLLECTION).doc(TOKEN_DOC_ID).get();
      if (doc.exists) return doc.data();
    } catch (err) {
      console.error("[Meta Auth] Firestore read failed:", err.message);
    }
  }

  return memoryTokenStore;
}

/**
 * Delete stored token data (disconnect).
 */
export async function deleteTokenData() {
  const db = await getFirestore();
  if (db) {
    try {
      await db.collection(TOKENS_COLLECTION).doc(TOKEN_DOC_ID).delete();
    } catch (err) {
      console.error("[Meta Auth] Firestore delete failed:", err.message);
    }
  }
  memoryTokenStore = null;
}

// ─── OAuth Token Exchange ──────────────────────────────────────

/**
 * Exchange an authorization code for a short-lived access token.
 */
export async function exchangeCodeForToken(code) {
  const { config } = getMetaConfig();

  if (!config.appId || !config.appSecret || !config.redirectUri) {
    throw new Error("META_APP_ID, META_APP_SECRET, and META_REDIRECT_URI are required");
  }

  const url = buildGraphUrl("/oauth/access_token", {
    client_id: config.appId,
    client_secret: config.appSecret,
    redirect_uri: config.redirectUri,
    code,
  });

  const res = await fetch(url, { method: "GET", cache: "no-store" });
  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || "Failed to exchange code for token");
  }

  return {
    accessToken: data.access_token,
    tokenType: data.token_type || "bearer",
    expiresIn: data.expires_in || 3600,
    isShortLived: true,
  };
}

/**
 * Exchange a short-lived token for a long-lived token (60 days).
 */
export async function exchangeForLongLivedToken(shortLivedToken) {
  const { config } = getMetaConfig();

  const url = buildGraphUrl("/oauth/access_token", {
    grant_type: "fb_exchange_token",
    client_id: config.appId,
    client_secret: config.appSecret,
    fb_exchange_token: shortLivedToken,
  });

  const res = await fetch(url, { method: "GET", cache: "no-store" });
  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || "Failed to exchange for long-lived token");
  }

  return {
    accessToken: data.access_token,
    tokenType: data.token_type || "bearer",
    expiresIn: data.expires_in || 5184000, // 60 days
    isShortLived: false,
  };
}

/**
 * Refresh a long-lived token (generates a new one valid for 60 more days).
 * Note: This only works if the current token is still valid.
 */
export async function refreshLongLivedToken(currentToken) {
  const { config } = getMetaConfig();

  const url = buildGraphUrl("/oauth/access_token", {
    grant_type: "fb_exchange_token",
    client_id: config.appId,
    client_secret: config.appSecret,
    fb_exchange_token: currentToken,
  });

  const res = await fetch(url, { method: "GET", cache: "no-store" });
  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || "Failed to refresh token");
  }

  return {
    accessToken: data.access_token,
    tokenType: data.token_type || "bearer",
    expiresIn: data.expires_in || 5184000,
    isShortLived: false,
  };
}

// ─── Account Discovery ─────────────────────────────────────────

/**
 * Discover connected Facebook Pages and Instagram Business accounts.
 */
export async function discoverConnectedAccounts(accessToken) {
  // 1. Get user's Facebook Pages
  const pagesUrl = buildGraphUrl("/me/accounts", {
    fields: "id,name,access_token,category,instagram_business_account{id,username,name,profile_picture_url,followers_count}",
    access_token: accessToken,
  });

  const pagesRes = await fetch(pagesUrl, { cache: "no-store" });
  const pagesData = await pagesRes.json();

  if (pagesData.error) {
    throw new Error(pagesData.error.message || "Failed to fetch connected pages");
  }

  const pages = (pagesData.data || []).map((page) => ({
    pageId: page.id,
    pageName: page.name,
    pageAccessToken: page.access_token,
    category: page.category || "",
    instagram: page.instagram_business_account
      ? {
          igAccountId: page.instagram_business_account.id,
          username: page.instagram_business_account.username,
          name: page.instagram_business_account.name,
          profilePic: page.instagram_business_account.profile_picture_url || "",
          followers: page.instagram_business_account.followers_count || 0,
        }
      : null,
  }));

  // 2. Get basic user info
  const meUrl = buildGraphUrl("/me", {
    fields: "id,name,email",
    access_token: accessToken,
  });

  const meRes = await fetch(meUrl, { cache: "no-store" });
  const meData = await meRes.json();

  return {
    user: {
      id: meData.id || "",
      name: meData.name || "",
      email: meData.email || "",
    },
    pages,
    hasInstagram: pages.some((p) => p.instagram !== null),
  };
}

// ─── Get Valid Access Token ────────────────────────────────────

/**
 * Returns a valid access token, auto-refreshing if needed.
 * Priority: Firestore stored token → env variable → error
 */
export async function getValidAccessToken() {
  // 1. Check stored token
  const stored = await getTokenData();

  if (stored?.accessToken) {
    const expiresAt = stored.expiresAt ? new Date(stored.expiresAt) : null;
    const now = new Date();

    // Token is still valid
    if (!expiresAt || expiresAt > now) {
      // Auto-refresh if expiring within 7 days
      if (expiresAt && (expiresAt - now) < 7 * 24 * 60 * 60 * 1000) {
        try {
          console.log("[Meta Auth] Token expiring soon, auto-refreshing...");
          const refreshed = await refreshLongLivedToken(stored.accessToken);
          const newData = {
            ...stored,
            accessToken: refreshed.accessToken,
            expiresAt: new Date(Date.now() + refreshed.expiresIn * 1000).toISOString(),
            lastRefreshedAt: new Date().toISOString(),
          };
          await saveTokenData(newData);
          return newData.accessToken;
        } catch (err) {
          console.warn("[Meta Auth] Auto-refresh failed, using current token:", err.message);
          return stored.accessToken;
        }
      }

      return stored.accessToken;
    }

    // Token expired — try to refresh
    try {
      console.log("[Meta Auth] Token expired, attempting refresh...");
      const refreshed = await refreshLongLivedToken(stored.accessToken);
      const newData = {
        ...stored,
        accessToken: refreshed.accessToken,
        expiresAt: new Date(Date.now() + refreshed.expiresIn * 1000).toISOString(),
        lastRefreshedAt: new Date().toISOString(),
      };
      await saveTokenData(newData);
      return newData.accessToken;
    } catch {
      // Refresh failed — token is truly dead
    }
  }

  // 2. Fallback to env variable
  const { config } = getMetaConfig();
  if (config.accessToken) {
    return config.accessToken;
  }

  throw new Error(
    "No valid Meta access token. Please connect your Meta account via Settings → Meta Connect."
  );
}

/**
 * Get the connected Instagram account ID.
 */
export async function getInstagramAccountId() {
  const stored = await getTokenData();
  if (stored?.igAccountId) return stored.igAccountId;

  const { config } = getMetaConfig();
  if (config.igAccountId) return config.igAccountId;

  throw new Error("No Instagram account connected. Please connect via Settings → Meta Connect.");
}

/**
 * Get the connected Facebook Page ID and its page access token.
 */
export async function getFacebookPageCredentials() {
  const stored = await getTokenData();
  if (stored?.fbPageId && stored?.pageAccessToken) {
    return { pageId: stored.fbPageId, pageAccessToken: stored.pageAccessToken };
  }

  const { config } = getMetaConfig();
  if (config.fbPageId) {
    // Page access token might be the user token if no stored page token
    const accessToken = await getValidAccessToken();
    return { pageId: config.fbPageId, pageAccessToken: accessToken };
  }

  throw new Error("No Facebook Page connected. Please connect via Settings → Meta Connect.");
}

// ─── Full OAuth Flow (Code → Long-Lived Token → Store) ────────

/**
 * Complete OAuth flow: exchange code, upgrade to long-lived, discover accounts, store everything.
 */
export async function completeOAuthFlow(code) {
  // Step 1: Exchange code for short-lived token
  console.log("[Meta Auth] Step 1: Exchanging authorization code...");
  const shortLived = await exchangeCodeForToken(code);

  // Step 2: Exchange for long-lived token
  console.log("[Meta Auth] Step 2: Upgrading to long-lived token...");
  const longLived = await exchangeForLongLivedToken(shortLived.accessToken);

  // Step 3: Discover connected accounts
  console.log("[Meta Auth] Step 3: Discovering connected accounts...");
  const accounts = await discoverConnectedAccounts(longLived.accessToken);

  // Step 4: Auto-select primary page and IG account
  const primaryPage = accounts.pages[0] || null;
  const igAccount = primaryPage?.instagram || null;

  // Step 5: Store everything
  const tokenData = {
    accessToken: longLived.accessToken,
    expiresAt: new Date(Date.now() + longLived.expiresIn * 1000).toISOString(),
    isShortLived: false,
    user: accounts.user,
    fbPageId: primaryPage?.pageId || "",
    fbPageName: primaryPage?.pageName || "",
    pageAccessToken: primaryPage?.pageAccessToken || "",
    igAccountId: igAccount?.igAccountId || "",
    igUsername: igAccount?.username || "",
    igName: igAccount?.name || "",
    igProfilePic: igAccount?.profilePic || "",
    igFollowers: igAccount?.followers || 0,
    connectedAt: new Date().toISOString(),
    lastRefreshedAt: new Date().toISOString(),
    allPages: accounts.pages,
  };

  await saveTokenData(tokenData);
  console.log("[Meta Auth] OAuth flow complete. Connected:", {
    fbPage: tokenData.fbPageName,
    igAccount: tokenData.igUsername,
  });

  return tokenData;
}

/**
 * Get full connection status for the UI.
 */
export async function getConnectionStatus() {
  const stored = await getTokenData();
  const { config, ready } = getMetaConfig();

  if (!stored && !config.accessToken) {
    return {
      connected: false,
      configured: ready,
      missing: ready ? [] : ["META_APP_ID", "META_APP_SECRET"],
      message: ready
        ? "Meta app configured but no account connected. Click 'Connect' to begin."
        : "Meta app credentials not configured. Add META_APP_ID and META_APP_SECRET to .env.local.",
    };
  }

  const expiresAt = stored?.expiresAt ? new Date(stored.expiresAt) : null;
  const now = new Date();
  const daysUntilExpiry = expiresAt ? Math.floor((expiresAt - now) / (1000 * 60 * 60 * 24)) : null;

  let tokenHealth = "healthy";
  if (expiresAt && expiresAt <= now) tokenHealth = "expired";
  else if (daysUntilExpiry !== null && daysUntilExpiry <= 7) tokenHealth = "expiring_soon";

  return {
    connected: true,
    configured: true,
    tokenHealth,
    daysUntilExpiry,
    expiresAt: expiresAt?.toISOString() || null,
    user: stored?.user || null,
    facebook: stored?.fbPageId
      ? { pageId: stored.fbPageId, pageName: stored.fbPageName }
      : null,
    instagram: stored?.igAccountId
      ? {
          accountId: stored.igAccountId,
          username: stored.igUsername,
          name: stored.igName,
          profilePic: stored.igProfilePic,
          followers: stored.igFollowers,
        }
      : null,
    connectedAt: stored?.connectedAt || null,
    lastRefreshedAt: stored?.lastRefreshedAt || null,
    allPages: stored?.allPages || [],
  };
}
