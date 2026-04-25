/**
 * SkilizeeAI — Instagram Crawler
 * Uses instagram120.p.rapidapi.com for real post/reel data.
 * Falls back to intelligent format recommendations when no API key.
 */

const RAPIDAPI_HOST = "instagram120.p.rapidapi.com";

/**
 * Strategy: Instagram API doesn't have a keyword search, so we use
 * a curated list of education-focused accounts mapped to common query terms.
 * When a topic is searched, we find the most relevant accounts and pull
 * their latest posts — giving real thumbnails, captions, and engagement data.
 */
const EDUCATION_ACCOUNTS = [
  "educationministry", "cbabordficial", "ncabordficial",
  "teachersofinstagram", "edutok_india", "education_world_india",
  "vedantu", "byjus", "unacademy", "physicswallah",
  "kaborddstation", "neet_preparation", "upsc_aspirants_hub",
  "parentingwithscience", "indianschools", "schooleducation",
  "childpsychologyindia", "educationpolicy", "studygram",
  "digitallearning", "edtechindia", "teacherlife",
];

export async function searchInstagram(query) {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) return generateFallback(query);

  try {
    // Pick 3 relevant accounts based on query keywords
    const accounts = pickRelevantAccounts(query);
    const results = [];

    for (const username of accounts) {
      try {
        const res = await fetch(`https://${RAPIDAPI_HOST}/api/instagram/posts`, {
          method: "POST",
          headers: {
            "x-rapidapi-key": apiKey,
            "x-rapidapi-host": RAPIDAPI_HOST,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, maxId: "" }),
          signal: AbortSignal.timeout(10000),
        });

        if (!res.ok) continue;
        const data = await res.json();

        // Parse the response — instagram120 returns posts in various formats
        const posts = extractPosts(data, username, query);
        results.push(...posts);
      } catch {
        continue; // Skip failed account, try next
      }
    }

    if (results.length > 0) {
      // Sort by engagement (likes + comments) and return top 10
      return results
        .sort((a, b) => (b.metrics.likes + b.metrics.comments) - (a.metrics.likes + a.metrics.comments))
        .slice(0, 10);
    }
  } catch (err) {
    console.warn("Instagram API failed, using fallback:", err.message);
  }

  return generateFallback(query);
}

/**
 * Extract normalized post objects from instagram120 API response.
 */
function extractPosts(data, username, query) {
  const posts = [];
  const items = data?.data?.posts || data?.data?.items || data?.items || data?.posts || [];
  const itemsArray = Array.isArray(items) ? items : [];

  for (const item of itemsArray.slice(0, 5)) {
    // Handle different response shapes
    const caption = item?.caption?.text || item?.caption || item?.text || "";
    const id = item?.id || item?.pk || item?.code || `ig_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const code = item?.code || item?.shortcode || "";
    const isVideo = item?.is_video || item?.media_type === 2 || item?.product_type === "clips";

    // Thumbnails
    const thumbnail =
      item?.image_versions2?.candidates?.[0]?.url ||
      item?.thumbnail_url ||
      item?.display_url ||
      item?.image_url ||
      item?.carousel_media?.[0]?.image_versions2?.candidates?.[0]?.url ||
      "";

    // Video URL for reels
    const videoUrl = item?.video_url || item?.video_versions?.[0]?.url || "";

    // Engagement metrics
    const likes = item?.like_count || item?.likes?.count || item?.likes || 0;
    const comments = item?.comment_count || item?.comments?.count || item?.comments || 0;
    const views = item?.view_count || item?.play_count || item?.video_view_count || 0;

    // Timestamp
    const timestamp = item?.taken_at || item?.taken_at_timestamp || item?.timestamp;
    const publishedAt = timestamp
      ? new Date(typeof timestamp === "number" && timestamp < 1e12 ? timestamp * 1000 : timestamp).toISOString()
      : new Date().toISOString();

    // Extract hashtags from caption
    const hashtags = (caption.match(/#[\w]+/g) || []).slice(0, 5);

    // Filter: only include if caption contains query-relevant words OR no filter needed
    const queryWords = query.toLowerCase().split(/\s+/);
    const captionLower = caption.toLowerCase();
    const isRelevant = queryWords.some((w) => w.length > 2 && captionLower.includes(w)) || caption.length === 0;

    if (!isRelevant && itemsArray.length > 5) continue;

    posts.push({
      id: `ig_${id}`,
      platform: "instagram",
      title: caption.substring(0, 120) || `Post by @${username}`,
      description: caption.substring(0, 300) || `Latest content from @${username}`,
      author: `@${username}`,
      url: code ? `https://www.instagram.com/p/${code}/` : `https://www.instagram.com/${username}/`,
      thumbnail,
      videoUrl: isVideo ? videoUrl : "",
      publishedAt,
      metrics: {
        views: views || 0,
        likes: typeof likes === "number" ? likes : 0,
        comments: typeof comments === "number" ? comments : 0,
        engagement: likes > 5000 ? "Very High" : likes > 1000 ? "High" : likes > 200 ? "Medium" : "Low",
      },
      tags: hashtags.length > 0 ? hashtags : [`#${query.replace(/\s+/g, "").toLowerCase()}`],
      contentFormat: isVideo ? "Reel / Video" : "Image Post",
      isVideo,
    });
  }

  return posts;
}

/**
 * Pick the most relevant accounts based on query keywords.
 */
function pickRelevantAccounts(query) {
  const q = query.toLowerCase();
  const scored = EDUCATION_ACCOUNTS.map((acc) => {
    let score = 0;
    const words = q.split(/\s+/);
    words.forEach((w) => {
      if (acc.includes(w)) score += 3;
    });
    // Boost education-specific accounts for common queries
    if (q.includes("school") && acc.includes("school")) score += 5;
    if (q.includes("education") && acc.includes("education")) score += 5;
    if (q.includes("nep") && (acc.includes("education") || acc.includes("policy"))) score += 4;
    if (q.includes("child") && (acc.includes("parent") || acc.includes("child"))) score += 4;
    if (q.includes("exam") && (acc.includes("neet") || acc.includes("upsc") || acc.includes("cbse"))) score += 4;
    if (q.includes("teacher") && acc.includes("teacher")) score += 5;
    if (q.includes("digital") && acc.includes("digital")) score += 4;
    // Add some randomness so we don't always query the same accounts
    score += Math.random() * 0.5;
    return { acc, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Always include at least one general education account
  const top = scored.slice(0, 3).map((s) => s.acc);
  if (!top.some((a) => a.includes("education"))) {
    top[2] = "educationministry";
  }
  return top;
}

/**
 * Fallback: Intelligent format recommendations (no API key).
 */
function generateFallback(query) {
  const hashtag = query.replace(/\s+/g, "").toLowerCase();
  const formats = [
    { type: "Reel", eng: "Very High", fmt: "15-60s vertical video", tip: "Use trending audio + text overlay for maximum reach" },
    { type: "Carousel", eng: "High", fmt: "8-12 slide post", tip: "Educational swipe content gets 3x saves" },
    { type: "Story Series", eng: "Medium", fmt: "Multi-part story", tip: "Polls and quizzes boost story completion rate" },
    { type: "Single Post", eng: "Medium", fmt: "Infographic/meme", tip: "Bold text + data = share-worthy posts" },
    { type: "Collab Reel", eng: "Very High", fmt: "Collaborative video", tip: "Collab reels get 2x the reach of solo reels" },
  ];

  return formats.map((f, i) => ({
    id: `ig_${hashtag}_${i}`,
    platform: "instagram",
    title: `${f.type}: "${query}" — ${f.fmt}`,
    description: `${f.tip}. Target #${hashtag} with ${f.eng.toLowerCase()} engagement potential.`,
    author: `#${hashtag}`,
    url: `https://www.instagram.com/explore/tags/${hashtag}/`,
    thumbnail: "",
    publishedAt: new Date().toISOString(),
    metrics: { views: 0, likes: 0, comments: 0, engagement: f.eng },
    tags: [`#${hashtag}`, `#${hashtag}tips`, "#trending", "#viral"],
    contentFormat: f.fmt,
    tip: f.tip,
    isFallback: true,
  }));
}
