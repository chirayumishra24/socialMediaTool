/**
 * SkilizeeAI — YouTube Crawler
 * YouTube Data API v3 search + HTML scraping fallback.
 */

const YT_API = "https://www.googleapis.com/youtube/v3";

export async function searchYouTube(query, apiKey, maxResults = 12) {
  if (!apiKey) return scrapeYouTube(query);

  try {
    const searchUrl = new URL(`${YT_API}/search`);
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("q", query);
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("order", "relevance");
    searchUrl.searchParams.set("maxResults", String(maxResults));
    searchUrl.searchParams.set("publishedAfter", daysAgo(30));
    searchUrl.searchParams.set("key", apiKey);

    const res = await fetch(searchUrl.toString());
    if (!res.ok) return scrapeYouTube(query);

    const data = await res.json();
    const ids = data.items?.map((i) => i.id.videoId).filter(Boolean).join(",");
    if (!ids) return [];

    const detailUrl = new URL(`${YT_API}/videos`);
    detailUrl.searchParams.set("part", "snippet,statistics,contentDetails");
    detailUrl.searchParams.set("id", ids);
    detailUrl.searchParams.set("key", apiKey);

    const detailRes = await fetch(detailUrl.toString());
    const detailData = await detailRes.json();

    return (detailData.items || []).map((item) => {
      const s = item.snippet;
      const st = item.statistics || {};
      return {
        id: item.id,
        platform: "youtube",
        title: s.title,
        description: (s.description || "").substring(0, 200),
        author: s.channelTitle,
        url: `https://youtube.com/watch?v=${item.id}`,
        thumbnail: s.thumbnails?.high?.url || s.thumbnails?.medium?.url || "",
        publishedAt: s.publishedAt,
        metrics: {
          views: parseInt(st.viewCount || "0"),
          likes: parseInt(st.likeCount || "0"),
          comments: parseInt(st.commentCount || "0"),
        },
        tags: s.tags?.slice(0, 10) || [],
        duration: parseDuration(item.contentDetails?.duration || ""),
      };
    });
  } catch (e) {
    console.error("YouTube API error:", e);
    return scrapeYouTube(query);
  }
}

async function scrapeYouTube(query) {
  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=CAMSAhAB`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      signal: AbortSignal.timeout(10000),
    });
    const html = await res.text();
    const m = html.match(/var ytInitialData = ({.*?});<\/script>/s);
    if (!m) return [];

    const data = JSON.parse(m[1]);
    const contents = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];

    return contents.filter((c) => c.videoRenderer).slice(0, 10).map((c) => {
      const v = c.videoRenderer;
      const viewText = v.viewCountText?.simpleText || "0";
      const viewNum = parseInt(viewText.replace(/[^0-9]/g, "")) || 0;
      return {
        id: v.videoId,
        platform: "youtube",
        title: v.title?.runs?.[0]?.text || "",
        description: v.detailedMetadataSnippets?.[0]?.snippetText?.runs?.map((r) => r.text).join("") || "",
        author: v.ownerText?.runs?.[0]?.text || "",
        url: `https://youtube.com/watch?v=${v.videoId}`,
        thumbnail: v.thumbnail?.thumbnails?.pop()?.url || "",
        publishedAt: v.publishedTimeText?.simpleText || "",
        metrics: { views: viewNum, likes: 0, comments: 0 },
        tags: [],
        duration: v.lengthText?.simpleText || "",
      };
    });
  } catch (e) {
    console.error("YouTube scrape error:", e);
    return [];
  }
}

function parseDuration(iso) {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return "";
  const h = parseInt(m[1] || "0"), min = parseInt(m[2] || "0"), s = parseInt(m[3] || "0");
  if (h > 0) return `${h}:${String(min).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${min}:${String(s).padStart(2, "0")}`;
}

function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString(); }
