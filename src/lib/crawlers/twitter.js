/**
 * SkilizeeAI — X/Twitter Crawler
 * Primary: twitter241.p.rapidapi.com API
 * Fallback 1: Nitter RSS proxy
 * Fallback 2: Hardcoded templates
 */

const RAPIDAPI_HOST = "twitter241.p.rapidapi.com";

const NITTER_INSTANCES = [
  "https://nitter.privacydev.net",
  "https://nitter.poast.org",
  "https://nitter.net",
];

export async function searchX(query) {
  // Try RapidAPI first (real data)
  const apiKey = process.env.RAPIDAPI_KEY;
  if (apiKey) {
    try {
      const results = await searchViaRapidAPI(query, apiKey);
      if (results.length > 0) return results;
    } catch (err) {
      console.warn("X RapidAPI failed, trying Nitter:", err.message);
    }
  }

  // Fallback to Nitter RSS
  const nitterResults = await searchViaNitter(query);
  if (nitterResults.length > 0) return nitterResults;

  // Last resort: hardcoded templates
  return generateFallback(query);
}

/**
 * Primary: Search tweets via twitter241 RapidAPI.
 */
async function searchViaRapidAPI(query, apiKey) {
  const res = await fetch(
    `https://${RAPIDAPI_HOST}/search?type=Latest&count=15&query=${encodeURIComponent(query)}`,
    {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": RAPIDAPI_HOST,
      },
      signal: AbortSignal.timeout(12000),
    }
  );

  if (!res.ok) throw new Error(`Twitter API returned ${res.status}`);
  const data = await res.json();

  // twitter241 returns tweets in various nested structures
  const tweets = extractTweets(data, query);
  return tweets;
}

/**
 * Extract normalized tweet objects from twitter241 API response.
 */
function extractTweets(data, query) {
  const results = [];

  // Navigate the response — twitter241 has nested timeline structures
  const entries =
    data?.result?.timeline?.instructions?.[0]?.entries ||
    data?.result?.timeline_v2?.timeline?.instructions?.[0]?.entries ||
    data?.timeline?.instructions?.[0]?.entries ||
    data?.data?.search_by_raw_query?.search_timeline?.timeline?.instructions?.[0]?.entries ||
    [];

  for (const entry of entries) {
    try {
      const tweetResult =
        entry?.content?.itemContent?.tweet_results?.result ||
        entry?.content?.content?.tweetResult?.result ||
        entry?.content?.itemContent?.tweet_result?.result ||
        null;

      if (!tweetResult) continue;

      const legacy = tweetResult?.legacy || tweetResult?.tweet?.legacy || {};
      const core = tweetResult?.core?.user_results?.result?.legacy ||
        tweetResult?.core?.user_result?.result?.legacy || {};

      const text = legacy?.full_text || legacy?.text || "";
      if (!text) continue;

      const tweetId = legacy?.id_str || tweetResult?.rest_id || "";
      const username = core?.screen_name || "unknown";
      const displayName = core?.name || username;
      const profileImage = core?.profile_image_url_https || "";

      // Engagement
      const likes = legacy?.favorite_count || 0;
      const retweets = legacy?.retweet_count || 0;
      const replies = legacy?.reply_count || 0;
      const views = tweetResult?.views?.count ? parseInt(tweetResult.views.count) : 0;
      const bookmarks = legacy?.bookmark_count || 0;

      // Media
      const media = legacy?.entities?.media?.[0] || legacy?.extended_entities?.media?.[0] || null;
      const thumbnail = media?.media_url_https || profileImage || "";

      // Timestamp
      const createdAt = legacy?.created_at;
      const publishedAt = createdAt ? new Date(createdAt).toISOString() : new Date().toISOString();

      // Hashtags
      const hashtags = (legacy?.entities?.hashtags || []).map((h) => `#${h.text}`).slice(0, 5);

      results.push({
        id: `x_${tweetId || hash(text)}`,
        platform: "x",
        title: text.substring(0, 280),
        description: text.substring(0, 200),
        author: `@${username}`,
        authorName: displayName,
        profileImage,
        url: tweetId ? `https://x.com/${username}/status/${tweetId}` : `https://x.com/search?q=${encodeURIComponent(query)}`,
        thumbnail,
        publishedAt,
        metrics: {
          views,
          likes,
          comments: replies,
          retweets,
          bookmarks,
          hashtags: hashtags.length,
        },
        tags: hashtags.length > 0 ? hashtags : [query.split(" ")[0]],
      });
    } catch {
      continue;
    }
  }

  return results.slice(0, 10);
}

/**
 * Fallback 1: Nitter RSS search.
 */
async function searchViaNitter(query) {
  for (const instance of NITTER_INSTANCES) {
    try {
      const url = `${instance}/search/rss?f=tweets&q=${encodeURIComponent(query)}`;
      const res = await fetch(url, {
        headers: { "User-Agent": "SkilizeeAI/2.0" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;
      const xml = await res.text();

      const items = [];
      const itemRe = /<item>([\s\S]*?)<\/item>/gi;
      let m;
      while ((m = itemRe.exec(xml)) !== null) {
        const x = m[1];
        const title = clean(extract(x, "title"));
        const link = extract(x, "link");
        const pub = extract(x, "pubDate");
        const creator = extract(x, "dc:creator") || extract(x, "creator");
        const desc = clean(extract(x, "description"));
        const hashtags = (title.match(/#\w+/g) || []);

        if (title) {
          items.push({
            id: hash(link || title),
            platform: "x",
            title: title.substring(0, 280),
            description: desc.substring(0, 200),
            author: creator || "Unknown",
            url: link?.replace(instance, "https://x.com") || "",
            thumbnail: "",
            publishedAt: pub ? new Date(pub).toISOString() : new Date().toISOString(),
            metrics: { views: 0, likes: 0, comments: 0, hashtags: hashtags.length },
            tags: hashtags.slice(0, 5),
          });
        }
      }
      if (items.length > 0) return items.slice(0, 10);
    } catch { continue; }
  }
  return [];
}

/**
 * Fallback 2: Hardcoded templates.
 */
function generateFallback(query) {
  const templates = [
    { pre: "Trending:", suf: "is trending right now" },
    { pre: "Thread:", suf: "— explained" },
    { pre: "Data:", suf: "— the data is noteworthy" },
    { pre: "1/", suf: "deep dive" },
    { pre: "Hot take:", suf: "perspectives" },
  ];
  return templates.map((t, i) => ({
    id: `x_${i}`, platform: "x",
    title: `${t.pre} ${query} ${t.suf}`,
    description: `Discussion about "${query}" on X.`,
    author: "@trending",
    url: `https://x.com/search?q=${encodeURIComponent(query)}`,
    thumbnail: "", publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
    metrics: { views: 0, likes: Math.floor(Math.random() * 5000), comments: Math.floor(Math.random() * 200) },
    tags: [query.split(" ")[0]], isFallback: true,
  }));
}

function extract(xml, tag) {
  const cdata = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, "i");
  const normal = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const cm = xml.match(cdata);
  if (cm) return cm[1].trim();
  const nm = xml.match(normal);
  return nm ? nm[1].trim() : "";
}

function clean(t) {
  return t.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; }
  return Math.abs(h).toString(36);
}
