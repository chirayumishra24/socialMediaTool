/**
 * YouTube Data API v3 - Global Trends Service
 * Fetches trending videos across multiple categories & regions
 */

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

// Category IDs: Education(27), Entertainment(24), Science & Tech(28), People & Blogs(22), Howto & Style(26)
const CATEGORY_IDS = ["27", "24", "28", "22", "26"];
const GLOBAL_REGIONS = ["IN", "US", "GB"];

/**
 * Fetch GLOBAL trending videos across multiple categories & regions.
 * Merges, deduplicates, and ranks by views.
 */
export async function fetchTrendingEducation(apiKey, regionCode = "IN", maxResults = 20) {
  const regions = regionCode === "IN" ? GLOBAL_REGIONS : [regionCode, ...GLOBAL_REGIONS.filter(r => r !== regionCode)];
  const allVideos = [];
  const seenIds = new Set();

  // Fetch from multiple categories × regions in parallel
  const fetches = [];
  for (const region of regions) {
    for (const catId of CATEGORY_IDS) {
      fetches.push(
        fetchCategory(apiKey, region, catId, 10).catch(() => [])
      );
    }
  }

  const results = await Promise.all(fetches);
  for (const videos of results) {
    for (const v of videos) {
      if (!seenIds.has(v.id)) {
        seenIds.add(v.id);
        allVideos.push(v);
      }
    }
  }

  // Sort by views descending, return top N
  allVideos.sort((a, b) => b.viewCount - a.viewCount);
  return allVideos.slice(0, maxResults);
}

/**
 * Fetch trending from a single category + region.
 */
async function fetchCategory(apiKey, regionCode, categoryId, maxResults) {
  const url = new URL(`${YOUTUBE_API_BASE}/videos`);
  url.searchParams.set("part", "snippet,statistics,contentDetails");
  url.searchParams.set("chart", "mostPopular");
  url.searchParams.set("videoCategoryId", categoryId);
  url.searchParams.set("regionCode", regionCode);
  url.searchParams.set("maxResults", maxResults.toString());
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  if (!response.ok) return [];

  const data = await response.json();
  return parseVideos(data.items || [], regionCode);
}

/**
 * Search for education-related videos by keyword
 */
export async function searchEducationVideos(apiKey, query, maxResults = 10) {
  const searchUrl = new URL(`${YOUTUBE_API_BASE}/search`);
  searchUrl.searchParams.set("part", "snippet");
  searchUrl.searchParams.set("q", query);
  searchUrl.searchParams.set("type", "video");
  searchUrl.searchParams.set("videoCategoryId", EDUCATION_CATEGORY_ID);
  searchUrl.searchParams.set("order", "viewCount");
  searchUrl.searchParams.set("maxResults", maxResults.toString());
  searchUrl.searchParams.set("publishedAfter", getDateDaysAgo(7).toISOString());
  searchUrl.searchParams.set("key", apiKey);

  const response = await fetch(searchUrl.toString());
  if (!response.ok) {
    throw new Error(`YouTube Search API error: ${response.status}`);
  }

  const data = await response.json();

  // Get full video details for statistics
  const videoIds = data.items.map((item) => item.id.videoId).join(",");
  if (!videoIds) return [];

  const detailsUrl = new URL(`${YOUTUBE_API_BASE}/videos`);
  detailsUrl.searchParams.set("part", "snippet,statistics,contentDetails");
  detailsUrl.searchParams.set("id", videoIds);
  detailsUrl.searchParams.set("key", apiKey);

  const detailsResponse = await fetch(detailsUrl.toString());
  const detailsData = await detailsResponse.json();

  return parseVideos(detailsData.items || []);
}

function parseVideos(items, region = "IN") {
  return items.map((item) => {
    const snippet = item.snippet;
    const stats = item.statistics || {};

    return {
      id: item.id,
      title: snippet.title,
      description: snippet.description?.substring(0, 300) || "",
      channelTitle: snippet.channelTitle,
      publishedAt: snippet.publishedAt,
      thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || "",
      tags: snippet.tags || [],
      categoryId: snippet.categoryId || "",
      region,
      viewCount: parseInt(stats.viewCount || "0"),
      likeCount: parseInt(stats.likeCount || "0"),
      commentCount: parseInt(stats.commentCount || "0"),
      duration: parseDuration(item.contentDetails?.duration || ""),
    };
  });
}

function parseDuration(iso8601) {
  const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";
  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");
  if (hours > 0) return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function getDateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Extract keywords from trending video data using TF-IDF-like approach
 */
export function extractKeywords(videos) {
  const stopWords = new Set([
    "the", "a", "an", "in", "on", "at", "to", "for", "of", "with",
    "by", "from", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "must", "shall", "can", "and", "but", "or",
    "nor", "not", "no", "so", "yet", "both", "either", "neither", "each",
    "every", "all", "any", "few", "more", "most", "other", "some", "such",
    "than", "too", "very", "just", "how", "what", "which", "who", "whom",
    "this", "that", "these", "those", "i", "me", "my", "myself", "we",
    "our", "you", "your", "he", "him", "his", "she", "her", "it", "its",
    "they", "them", "their", "about", "up", "out", "if", "then", "because",
    "as", "until", "while", "during", "before", "after", "above", "below",
    "between", "through", "into", "over", "under", "again", "further",
    "video", "watch", "subscribe", "like", "share", "channel", "click",
    "link", "description", "below", "comment", "comments"
  ]);

  const wordFreq = {};

  videos.forEach((video) => {
    const text = `${video.title} ${video.tags?.join(" ") || ""} ${video.description}`;
    const words = text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));

    // Weight by video views (normalized)
    const weight = Math.log10(Math.max(video.viewCount, 1));

    words.forEach((word) => {
      wordFreq[word] = (wordFreq[word] || 0) + weight;
    });
  });

  // Build bigrams for compound keywords
  const bigramFreq = {};
  videos.forEach((video) => {
    const words = video.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));

    for (let i = 0; i < words.length - 1; i++) {
      const bigram = `${words[i]} ${words[i + 1]}`;
      const weight = Math.log10(Math.max(video.viewCount, 1));
      bigramFreq[bigram] = (bigramFreq[bigram] || 0) + weight;
    }
  });

  const sorted = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([word, score]) => ({ keyword: word, score: Math.round(score * 10) }));

  const sortedBigrams = Object.entries(bigramFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([phrase, score]) => ({ keyword: phrase, score: Math.round(score * 10) }));

  return {
    primary: sortedBigrams.slice(0, 5),
    secondary: [...sortedBigrams.slice(5), ...sorted.slice(0, 10)],
    longTail: sorted.slice(10, 25),
  };
}
