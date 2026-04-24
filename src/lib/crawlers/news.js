/**
 * SkilizeeAI — News Crawler
 * Google News + Bing News RSS aggregation.
 */

export async function searchNews(query) {
  const sources = [
    { name: "Google News", url: `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en` },
    { name: "Bing News", url: `https://www.bing.com/news/search?q=${encodeURIComponent(query)}&format=rss` },
  ];

  const all = [];

  await Promise.all(sources.map(async (src) => {
    try {
      const res = await fetch(src.url, {
        headers: { "User-Agent": "SkilizeeAI/2.0 (NewsDiscovery)" },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) return;
      const xml = await res.text();

      const itemRe = /<item>([\s\S]*?)<\/item>/gi;
      let m;
      while ((m = itemRe.exec(xml)) !== null) {
        const x = m[1];
        const title = clean(extract(x, "title"));
        const link = extract(x, "link");
        const pub = extract(x, "pubDate");
        const desc = clean(extract(x, "description"));
        const source = clean(extract(x, "source")) || src.name;

        if (title) {
          const hoursAgo = (Date.now() - new Date(pub || Date.now()).getTime()) / 3600000;
          all.push({
            id: hash(link || title),
            platform: "news",
            title,
            description: desc.substring(0, 200),
            author: source,
            url: link || "",
            thumbnail: "",
            publishedAt: pub ? new Date(pub).toISOString() : new Date().toISOString(),
            metrics: { views: 0, likes: 0, comments: 0 },
            tags: [src.name],
            recencyScore: Math.max(0, 100 - hoursAgo * 2),
          });
        }
      }
    } catch (e) { console.error(`News error (${src.name}):`, e); }
  }));

  const seen = new Set();
  return all.filter((a) => {
    const key = a.title.toLowerCase().substring(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => (b.recencyScore || 0) - (a.recencyScore || 0)).slice(0, 12);
}

function extract(xml, tag) {
  const cdata = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, "i");
  const normal = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const cm = xml.match(cdata); if (cm) return cm[1].trim();
  const nm = xml.match(normal); return nm ? nm[1].trim() : "";
}

function clean(t) {
  return t.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ").trim();
}

function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; } return Math.abs(h).toString(36); }
