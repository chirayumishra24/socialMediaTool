/**
 * SkilizeeAI — Google Trends Crawler
 * Keyword interest, related queries, regional data.
 */

export async function getTrends(keyword, region = "IN") {
  // Google Trends doesn't have a public API, so we use the RSS endpoint
  try {
    const url = `https://trends.google.com/trending/rss?geo=${region}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "SkilizeeAI/2.0" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return { trending: [], related: [] };
    const xml = await res.text();

    const items = [];
    const itemRe = /<item>([\s\S]*?)<\/item>/gi;
    let m;
    while ((m = itemRe.exec(xml)) !== null) {
      const x = m[1];
      const title = extract(x, "title");
      const traffic = extract(x, "ht:approx_traffic") || extract(x, "ht:picture_source");
      const newsUrl = extract(x, "ht:news_item_url") || extract(x, "link");

      if (title) {
        items.push({
          keyword: clean(title),
          traffic: traffic || "Unknown",
          url: newsUrl || "",
          isRelevant: title.toLowerCase().includes(keyword.toLowerCase()),
        });
      }
    }

    return {
      trending: items.slice(0, 20),
      related: items.filter((t) => t.isRelevant).slice(0, 5),
      region,
    };
  } catch (e) {
    console.error("Trends error:", e);
    return { trending: [], related: [], region };
  }
}

function extract(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = xml.match(re);
  return m ? m[1].trim() : "";
}

function clean(t) {
  return t.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim();
}
