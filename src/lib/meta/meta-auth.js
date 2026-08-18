/**
 * Skilizee — Meta OAuth 2.0 & Token Management (Multi-Account)
 *
 * Handles the full OAuth lifecycle per account:
 * 1. Exchange authorization code for short-lived token
 * 2. Exchange short-lived → long-lived token (60 days)
 * 3. Refresh long-lived tokens before expiry
 * 4. Store/retrieve tokens from Firestore (keyed by accountId)
 * 5. Auto-discover connected IG accounts and FB Pages
 */

import { getMetaConfig, buildGraphUrl, GRAPH_API_BASE } from "./meta-config";

// ─── Token Storage (Firestore or in-memory fallback) ───────────

let firestoreDb = null;
const TOKENS_COLLECTION = "meta_tokens";

// Pre-multi-account token document, and the account that inherits it.
const LEGACY_TOKEN_DOC_ID = "primary";
const LEGACY_OWNER_ACCOUNT_ID = "skillizee";

// In-memory fallback when Firestore is unavailable (keyed by accountId)
const memoryTokenStore = {};

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
 * @param {object} tokenData
 * @param {string} accountId - Account ID for scoping
 */
export async function saveTokenData(tokenData, accountId = "skillizee") {
  const data = {
    ...tokenData,
    accountId,
    updatedAt: new Date().toISOString(),
  };

  const db = await getFirestore();
  if (db) {
    try {
      await db.collection(TOKENS_COLLECTION).doc(accountId).set(data, { merge: true });
      console.log(`[Meta Auth] Token saved to Firestore for account: ${accountId}`);
      return data;
    } catch (err) {
      console.error(`[Meta Auth] Firestore save failed for ${accountId}:`, err.message);
    }
  }

  // Memory fallback
  memoryTokenStore[accountId] = data;
  console.log(`[Meta Auth] Token saved to memory for ${accountId} (Firestore unavailable)`);
  return data;
}

/**
 * Retrieve stored token data.
 * @param {string} accountId
 */
export async function getTokenData(accountId = "skillizee") {
  const db = await getFirestore();
  if (db) {
    try {
      const doc = await db.collection(TOKENS_COLLECTION).doc(accountId).get();
      if (doc.exists) return doc.data();

      // Migration: before multi-account support every token lived at
      // meta_tokens/primary. Adopt it for the default account once, so the
      // existing Skillizee connection is not silently lost.
      if (accountId === LEGACY_OWNER_ACCOUNT_ID) {
        const legacy = await db.collection(TOKENS_COLLECTION).doc(LEGACY_TOKEN_DOC_ID).get();
        if (legacy.exists) {
          const data = { ...legacy.data(), accountId, migratedFrom: LEGACY_TOKEN_DOC_ID };
          await db.collection(TOKENS_COLLECTION).doc(accountId).set(data, { merge: true });
          console.log(`[Meta Auth] Migrated legacy token '${LEGACY_TOKEN_DOC_ID}' → '${accountId}'`);
          return data;
        }
      }
    } catch (err) {
      console.error(`[Meta Auth] Firestore read failed for ${accountId}:`, err.message);
    }
  }

  return memoryTokenStore[accountId] || null;
}

/**
 * Delete stored token data (disconnect).
 * @param {string} accountId
 */
export async function deleteTokenData(accountId = "skillizee") {
  const db = await getFirestore();
  if (db) {
    try {
      await db.collection(TOKENS_COLLECTION).doc(accountId).delete();
    } catch (err) {
      console.error(`[Meta Auth] Firestore delete failed for ${accountId}:`, err.message);
    }
  }
  delete memoryTokenStore[accountId];
}

// ─── OAuth Token Exchange ──────────────────────────────────────

/**
 * Exchange an authorization code for a short-lived access token.
 * @param {string} code
 * @param {string} accountId
 */
export async function exchangeCodeForToken(code, accountId = "skillizee") {
  const { config } = getMetaConfig(accountId);

  if (!config.appId || !config.appSecret || !config.redirectUri) {
    throw new Error(`${accountId}: APP_ID, APP_SECRET, and REDIRECT_URI are required`);
  }

  const url = buildGraphUrl("/oauth/access_token", {
    client_id: config.appId,
    client_secret: config.appSecret,
    redirect_uri: config.redirectUri,
    code,
  }, undefined, accountId);

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
export async function exchangeForLongLivedToken(shortLivedToken, accountId = "skillizee") {
  const { config } = getMetaConfig(accountId);

  const url = buildGraphUrl("/oauth/access_token", {
    grant_type: "fb_exchange_token",
    client_id: config.appId,
    client_secret: config.appSecret,
    fb_exchange_token: shortLivedToken,
  }, undefined, accountId);

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
 */
export async function refreshLongLivedToken(currentToken, accountId = "skillizee") {
  const { config } = getMetaConfig(accountId);

  const url = buildGraphUrl("/oauth/access_token", {
    grant_type: "fb_exchange_token",
    client_id: config.appId,
    client_secret: config.appSecret,
    fb_exchange_token: currentToken,
  }, undefined, accountId);

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
export async function discoverConnectedAccounts(accessToken, accountId = "skillizee") {
  // 1. Get user's Facebook Pages
  const pagesUrl = buildGraphUrl("/me/accounts", {
    fields: "id,name,access_token,category,instagram_business_account{id,username,name,profile_picture_url,followers_count}",
    access_token: accessToken,
  }, undefined, accountId);

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
  }, undefined, accountId);

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
 * @param {string} accountId
 */
export async function getValidAccessToken(accountId = "skillizee") {
  // 1. Check stored token
  const stored = await getTokenData(accountId);

  if (stored?.accessToken) {
    const expiresAt = stored.expiresAt ? new Date(stored.expiresAt) : null;
    const now = new Date();

    // Token is still valid
    if (!expiresAt || expiresAt > now) {
      // Auto-refresh if expiring within 7 days
      if (expiresAt && (expiresAt - now) < 7 * 24 * 60 * 60 * 1000) {
        try {
          console.log(`[Meta Auth] [${accountId}] Token expiring soon, auto-refreshing...`);
          const refreshed = await refreshLongLivedToken(stored.accessToken, accountId);
          const newData = {
            ...stored,
            accessToken: refreshed.accessToken,
            expiresAt: new Date(Date.now() + refreshed.expiresIn * 1000).toISOString(),
            lastRefreshedAt: new Date().toISOString(),
          };
          await saveTokenData(newData, accountId);
          return newData.accessToken;
        } catch (err) {
          console.warn(`[Meta Auth] [${accountId}] Auto-refresh failed, using current token:`, err.message);
          return stored.accessToken;
        }
      }

      return stored.accessToken;
    }

    // Token expired — try to refresh
    try {
      console.log(`[Meta Auth] [${accountId}] Token expired, attempting refresh...`);
      const refreshed = await refreshLongLivedToken(stored.accessToken, accountId);
      const newData = {
        ...stored,
        accessToken: refreshed.accessToken,
        expiresAt: new Date(Date.now() + refreshed.expiresIn * 1000).toISOString(),
        lastRefreshedAt: new Date().toISOString(),
      };
      await saveTokenData(newData, accountId);
      return newData.accessToken;
    } catch {
      // Refresh failed — token is truly dead
    }
  }

  // 2. Fallback to env variable
  const { config } = getMetaConfig(accountId);
  if (config.accessToken) {
    return config.accessToken;
  }

  throw new Error(
    `No valid Meta access token for ${accountId}. Please connect your Meta account via Settings → Meta Connect.`
  );
}

/**
 * Get the connected Instagram account ID.
 * @param {string} accountId
 */
export async function getInstagramAccountId(accountId = "skillizee") {
  const stored = await getTokenData(accountId);
  if (stored?.igAccountId) return stored.igAccountId;

  const { config } = getMetaConfig(accountId);
  if (config.igAccountId) return config.igAccountId;

  throw new Error(`No Instagram account connected for ${accountId}. Please connect via Settings → Meta Connect.`);
}

/**
 * Get the connected Facebook Page ID and its page access token.
 * @param {string} accountId
 */
export async function getFacebookPageCredentials(accountId = "skillizee") {
  const stored = await getTokenData(accountId);
  if (stored?.fbPageId && stored?.pageAccessToken) {
    return { pageId: stored.fbPageId, pageAccessToken: stored.pageAccessToken };
  }

  const { config } = getMetaConfig(accountId);
  if (config.fbPageId) {
    const accessToken = await getValidAccessToken(accountId);
    return { pageId: config.fbPageId, pageAccessToken: accessToken };
  }

  throw new Error(`No Facebook Page connected for ${accountId}. Please connect via Settings → Meta Connect.`);
}

// ─── Full OAuth Flow (Code → Long-Lived Token → Store) ────────

/**
 * Complete OAuth flow: exchange code, upgrade to long-lived, discover accounts, store everything.
 * @param {string} code
 * @param {string} accountId
 */
export async function completeOAuthFlow(code, accountId = "skillizee") {
  // Step 1: Exchange code for short-lived token
  console.log(`[Meta Auth] [${accountId}] Step 1: Exchanging authorization code...`);
  const shortLived = await exchangeCodeForToken(code, accountId);

  // Step 2: Exchange for long-lived token
  console.log(`[Meta Auth] [${accountId}] Step 2: Upgrading to long-lived token...`);
  const longLived = await exchangeForLongLivedToken(shortLived.accessToken, accountId);

  // Step 3: Discover connected accounts
  console.log(`[Meta Auth] [${accountId}] Step 3: Discovering connected accounts...`);
  const accounts = await discoverConnectedAccounts(longLived.accessToken, accountId);

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

  await saveTokenData(tokenData, accountId);
  console.log(`[Meta Auth] [${accountId}] OAuth flow complete. Connected:`, {
    fbPage: tokenData.fbPageName,
    igAccount: tokenData.igUsername,
  });

  return tokenData;
}

/**
 * Get full connection status for the UI.
 * @param {string} accountId
 */
export async function getConnectionStatus(accountId = "skillizee") {
  const stored = await getTokenData(accountId);
  const { config, ready, missing } = getMetaConfig(accountId);

  if (!stored && !config.accessToken) {
    return {
      connected: false,
      configured: ready,
      accountId,
      // getMetaConfig already reports the real env var names for this account
      // (META_APP_ID vs CCIS_META_APP_ID) — don't re-derive them from the id.
      missing,
      message: ready
        ? `Meta app configured for ${accountId} but no account connected. Click 'Connect' to begin.`
        : `Meta app credentials not configured for ${accountId}. Add credentials to .env.local.`,
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
    accountId,
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
