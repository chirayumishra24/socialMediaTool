/**
 * SkilizeeAI — Reddit Crawler
 * Search + hot/rising with virality scoring.
 */

export async function searchReddit(query, maxResults = 10) {
  try {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=relevance&t=month&limit=${maxResults}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "SkilizeeAI/2.0 (ContentIntelligence)" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const data = await res.json();

    return (data.data?.children || []).map(({ data: p }) => ({
      id: p.id,
      platform: "reddit",
      title: p.title,
      description: (p.selftext || "").substring(0, 200),
      author: `u/${p.author}`,
      url: `https://reddit.com${p.permalink}`,
      thumbnail: p.thumbnail?.startsWith("http") ? p.thumbnail : "",
      publishedAt: new Date(p.created_utc * 1000).toISOString(),
      metrics: { views: 0, likes: p.score, comments: p.num_comments },
      subreddit: p.subreddit,
      tags: [p.subreddit, p.link_flair_text].filter(Boolean),
    }));
  } catch (e) {
    console.error("Reddit error:", e);
    return [];
  }
}

export async function getRedditHot(subreddits = ["all"], limit = 5) {
  const allPosts = [];
  const subs = subreddits.slice(0, 3);

  await Promise.all(subs.map(async (sub) => {
    try {
      const res = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=${limit}`, {
        headers: { "User-Agent": "SkilizeeAI/2.0" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return;
      const data = await res.json();
      data.data.children.forEach(({ data: p }) => {
        if (p.stickied) return;
        allPosts.push({
          id: p.id, platform: "reddit", title: p.title,
          description: (p.selftext || "").substring(0, 150),
          author: `u/${p.author}`, url: `https://reddit.com${p.permalink}`,
          thumbnail: p.thumbnail?.startsWith("http") ? p.thumbnail : "",
          publishedAt: new Date(p.created_utc * 1000).toISOString(),
          metrics: { views: 0, likes: p.score, comments: p.num_comments },
          subreddit: p.subreddit, tags: [p.subreddit],
        });
      });
    } catch {}
  }));

  return allPosts.sort((a, b) => b.metrics.likes - a.metrics.likes);
}
