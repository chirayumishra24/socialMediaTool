/**
 * SkilizeeAI — X/Twitter Crawler
 * Nitter RSS proxy with multi-instance failover.
 */

const NITTER_INSTANCES = [
  "https://nitter.privacydev.net",
  "https://nitter.poast.org",
  "https://nitter.net",
];

export async function searchX(query) {
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
  return generateFallback(query);
}

function generateFallback(query) {
  const templates = [
    { pre: "🔥", suf: "is trending right now" },
    { pre: "💡 Thread:", suf: "— explained" },
    { pre: "📊", suf: "— the data is shocking" },
    { pre: "🧵 1/", suf: "deep dive" },
    { pre: "Hot take:", suf: "is overhyped" },
  ];
  return templates.map((t, i) => ({
    id: `x_${i}`, platform: "x",
    title: `${t.pre} ${query} ${t.suf}`,
    description: `Discussion about "${query}" on X.`,
    author: "@trending", url: `https://x.com/search?q=${encodeURIComponent(query)}`,
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
