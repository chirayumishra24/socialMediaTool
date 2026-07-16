/**
 * SkilizeeAI — Instagram Profile Scraper
 * 
 * Strategy:
 * 1. Try RapidAPI instagram120 (if subscribed)
 * 2. Try RapidAPI instagram-scraper-api2 (if subscribed)
 * 3. Fallback: Return a "manual entry needed" flag so the UI 
 *    lets users paste their stats directly
 */

const RAPIDAPI_HOSTS = [
  { host: "instagram120.p.rapidapi.com", profilePath: null, postsPath: "/api/instagram/posts", postsMethod: "POST" },
  { host: "instagram-scraper-api2.p.rapidapi.com", profilePath: "/v1/info", postsPath: "/v1/posts", postsMethod: "GET" },
];

/**
 * Scrape a public Instagram profile.
 * @param {string} username
 * @returns {Promise<{profile, posts, analysis, source}>}
 */
export async function scrapeProfile(username) {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) throw new Error("RAPIDAPI_KEY is not configured");

  const cleanUsername = username.replace(/^@/, "").trim();
  if (!cleanUsername) throw new Error("Username is required");

  // Try each API host
  for (const api of RAPIDAPI_HOSTS) {
    try {
      const result = await tryApi(api, cleanUsername, apiKey);
      if (result && result.posts.length > 0) {
        return { ...result, source: api.host };
      }
    } catch (err) {
      console.warn(`[IG Scraper] ${api.host} failed:`, err.message);
      continue;
    }
  }

  // All APIs failed — return empty result with manual flag
  return {
    profile: {
      username: cleanUsername,
      fullName: "",
      bio: "",
      followers: 0,
      following: 0,
      postCount: 0,
      profilePic: "",
      isVerified: false,
      externalUrl: "",
      category: "",
    },
    posts: [],
    analysis: emptyAnalysis(),
    source: "manual",
    needsManualInput: true,
    message: "Instagram APIs unavailable. Please enter your profile stats manually.",
  };
}

/**
 * Build profile data from manually entered stats (UI fallback).
 */
export function buildManualProfile(manualData) {
  // Check if payload is from the Chrome Extension (which has a nested structure)
  const isExtension = manualData.profile && Array.isArray(manualData.posts);
  
  const rawProfile = isExtension ? manualData.profile : manualData;
  const rawPosts = isExtension ? manualData.posts : (manualData.recentPosts || []);

  const profile = {
    username: rawProfile.username || "",
    fullName: rawProfile.fullName || "",
    bio: rawProfile.bio || "",
    followers: parseInt(rawProfile.followers) || 0,
    following: parseInt(rawProfile.following) || 0,
    postCount: parseInt(rawProfile.postCount) || 0,
    profilePic: rawProfile.profilePic || "",
    isVerified: !!rawProfile.isVerified,
    externalUrl: rawProfile.externalUrl || "",
    category: rawProfile.category || "",
  };

  // Build posts mapping
  const posts = rawPosts.map((p, i) => ({
    id: p.id || `manual_${i}`,
    caption: p.caption || "",
    contentType: p.contentType || "Static Image",
    likes: parseInt(p.likes) || 0,
    comments: parseInt(p.comments) || 0,
    views: parseInt(p.views) || 0,
    timestamp: p.timestamp || p.date || null,
    thumbnail: p.thumbnail || "",
    hashtags: p.hashtags || (p.caption || "").match(/#[\w]+/g) || [],
    url: p.url || "",
    engagementLevel: p.engagementLevel || (parseInt(p.likes) > 5000 ? "Very High" : parseInt(p.likes) > 1000 ? "High" : parseInt(p.likes) > 200 ? "Medium" : "Low"),
  }));

  return {
    profile,
    posts,
    analysis: computeAnalytics(posts, profile),
    source: isExtension ? "extension" : "manual",
  };
}

// ─── Try a specific API ─────────────────────────────────────

async function tryApi(api, username, apiKey) {
  const headers = {
    "x-rapidapi-key": apiKey,
    "x-rapidapi-host": api.host,
    "Content-Type": "application/json",
  };

  let postsData;
  if (api.postsMethod === "POST") {
    const res = await fetch(`https://${api.host}${api.postsPath}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ username, maxId: "" }),
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) throw new Error(`${res.status}`);
    postsData = await res.json();
  } else {
    const url = `https://${api.host}${api.postsPath}?username_or_id_or_url=${encodeURIComponent(username)}`;
    const res = await fetch(url, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) throw new Error(`${res.status}`);
    postsData = await res.json();
  }

  const profile = extractProfileFromResponse(postsData, username);
  const posts = extractPosts(postsData);
  const analysis = computeAnalytics(posts, profile);

  return { profile, posts, analysis };
}

// ─── Extract Profile from Response ──────────────────────────

function extractProfileFromResponse(data, username) {
  const user = data?.data?.user || data?.user || data?.data?.owner || data?.owner || {};
  const firstPost = data?.data?.posts?.[0] || data?.data?.items?.[0] || data?.items?.[0] || {};
  const postOwner = firstPost?.user || firstPost?.owner || {};

  return {
    username: user.username || postOwner.username || username,
    fullName: user.full_name || postOwner.full_name || "",
    bio: user.biography || user.bio || postOwner.biography || "",
    followers: user.follower_count || user.followers_count || user.followers || postOwner.follower_count || 0,
    following: user.following_count || user.followings_count || user.following || postOwner.following_count || 0,
    postCount: user.media_count || user.post_count || postOwner.media_count || 0,
    profilePic: user.profile_pic_url || user.profile_pic_url_hd || postOwner.profile_pic_url || "",
    isVerified: user.is_verified || postOwner.is_verified || false,
    externalUrl: user.external_url || "",
    category: user.category_name || user.category || "",
  };
}

// ─── Extract Posts ──────────────────────────────────────────

function extractPosts(data) {
  const items = data?.data?.posts || data?.data?.items || data?.items || data?.posts || [];
  const itemsArray = Array.isArray(items) ? items : [];

  return itemsArray.slice(0, 12).map((item) => {
    const caption = item?.caption?.text || item?.caption || item?.text || "";
    const code = item?.code || item?.shortcode || "";
    const isVideo = item?.is_video || item?.media_type === 2 || item?.product_type === "clips";
    const isCarousel = item?.media_type === 8 || item?.carousel_media_count > 0 || (item?.carousel_media?.length > 0);

    const likes = item?.like_count || item?.likes?.count || item?.likes || 0;
    const comments = item?.comment_count || item?.comments?.count || item?.comments || 0;
    const views = item?.view_count || item?.play_count || item?.video_view_count || 0;

    const timestamp = item?.taken_at || item?.taken_at_timestamp || item?.timestamp;
    const publishedAt = timestamp
      ? new Date(typeof timestamp === "number" && timestamp < 1e12 ? timestamp * 1000 : timestamp).toISOString()
      : null;

    const thumbnail = item?.image_versions2?.candidates?.[0]?.url || item?.thumbnail_url || item?.display_url || item?.image_url || "";
    const hashtags = (caption.match(/#[\w]+/g) || []).slice(0, 10);

    let contentType = "Static Image";
    if (isVideo) contentType = "Reel / Video";
    else if (isCarousel) contentType = "Carousel";

    return {
      id: item?.id || item?.pk || code || `ig_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      caption: caption.substring(0, 500),
      contentType,
      likes: typeof likes === "number" ? likes : 0,
      comments: typeof comments === "number" ? comments : 0,
      views: views || 0,
      timestamp: publishedAt,
      thumbnail,
      hashtags,
      url: code ? `https://www.instagram.com/p/${code}/` : "",
      engagementLevel: likes > 5000 ? "Very High" : likes > 1000 ? "High" : likes > 200 ? "Medium" : "Low",
    };
  });
}

// ─── Analytics ──────────────────────────────────────────────

function computeAnalytics(posts, profile) {
  if (!posts.length) return emptyAnalysis();

  const totalLikes = posts.reduce((s, p) => s + p.likes, 0);
  const totalComments = posts.reduce((s, p) => s + p.comments, 0);
  const totalViews = posts.reduce((s, p) => s + p.views, 0);

  const avgLikes = Math.round(totalLikes / posts.length);
  const avgComments = Math.round(totalComments / posts.length);
  const avgViews = Math.round(totalViews / posts.length);

  const followers = profile.followers || 1;
  const engagementRate = (((avgLikes + avgComments) / followers) * 100).toFixed(2);

  const reels = posts.filter((p) => p.contentType === "Reel / Video").length;
  const carousels = posts.filter((p) => p.contentType === "Carousel").length;
  const staticPosts = posts.filter((p) => p.contentType === "Static Image").length;

  const topFormat = reels >= carousels && reels >= staticPosts ? "Reels" : carousels >= staticPosts ? "Carousels" : "Static Images";

  let postingFrequency = "Unknown";
  const timestamps = posts.map((p) => p.timestamp).filter(Boolean).sort();
  if (timestamps.length >= 2) {
    const daySpan = Math.max(1, (new Date(timestamps[timestamps.length - 1]) - new Date(timestamps[0])) / (1000 * 60 * 60 * 24));
    postingFrequency = `~${((timestamps.length / daySpan) * 7).toFixed(1)} posts/week`;
  }

  const sorted = [...posts].sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments));

  return {
    avgLikes, avgComments, avgViews, engagementRate,
    formatDistribution: { reels, carousels, static: staticPosts },
    topFormat, postingFrequency,
    bestPerformingPost: sorted[0] || null,
    worstPerformingPost: sorted[sorted.length - 1] || null,
  };
}

function emptyAnalysis() {
  return {
    avgLikes: 0, avgComments: 0, avgViews: 0, engagementRate: "0.00",
    formatDistribution: { reels: 0, carousels: 0, static: 0 },
    topFormat: "Unknown", postingFrequency: "Unknown",
    bestPerformingPost: null, worstPerformingPost: null,
  };
}
