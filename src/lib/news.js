/**
 * News & Current Affairs Intelligence Service
 * Ingests RSS feeds from trusted education publishers
 * Calculates News Relevance Score (NRS)
 */

// Trusted publisher RSS feeds (all free, no API key needed)
const RSS_FEEDS = [
  { name: "BBC Education", url: "https://feeds.bbci.co.uk/news/education/rss.xml", category: "education" },
  { name: "BBC Science", url: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml", category: "science" },
  { name: "BBC Technology", url: "https://feeds.bbci.co.uk/news/technology/rss.xml", category: "technology" },
  { name: "Reuters Science", url: "https://www.reutersagency.com/feed/?taxonomy=best-sectors&post_type=best&best-sectors=science-technology", category: "science" },
  { name: "Science Daily", url: "https://www.sciencedaily.com/rss/all.xml", category: "science" },
  { name: "TechCrunch", url: "https://techcrunch.com/feed/", category: "technology" },
  { name: "EdSurge", url: "https://www.edsurge.com/rss", category: "education" },
  { name: "MIT Technology Review", url: "https://www.technologyreview.com/feed/", category: "technology" },
  { name: "The Hindu Education", url: "https://www.thehindu.com/education/feeder/default.rss", category: "education_india" },
  { name: "NDTV Education", url: "https://feeds.feedburner.com/ndtv/education-feed", category: "education_india" },
];

// Education-relevant keywords for scoring
const EDUCATION_KEYWORDS = [
  "education", "school", "student", "teacher", "learning", "curriculum",
  "exam", "study", "university", "college", "science", "math", "physics",
  "chemistry", "biology", "history", "geography", "technology", "ai",
  "artificial intelligence", "research", "discovery", "space", "nasa",
  "climate", "environment", "health", "psychology", "brain", "memory",
  "language", "coding", "programming", "engineering", "medicine",
  "cbse", "neet", "jee", "board exam", "nep", "policy", "government",
  "scholarship", "skill", "career", "job", "internship", "startup",
  "innovation", "robotics", "quantum", "dna", "genome", "vaccine",
  "satellite", "telescope", "mars", "moon", "ocean", "biodiversity",
  "renewable", "solar", "nuclear", "economy", "budget",
];

/**
 * Parse an RSS/XML feed into structured articles
 */
async function parseRSSFeed(feedUrl, sourceName, category) {
  try {
    const response = await fetch(feedUrl, {
      signal: AbortSignal.timeout(10000),
      headers: { "User-Agent": "EduTrend-AI-Agent/1.0" },
    });

    if (!response.ok) return [];

    const xml = await response.text();
    const articles = [];

    // Simple XML parser for RSS — extracts <item> elements
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];

      const title = extractTag(itemXml, "title");
      const description = extractTag(itemXml, "description");
      const link = extractTag(itemXml, "link");
      const pubDate = extractTag(itemXml, "pubDate");

      if (title) {
        articles.push({
          id: generateId(title + link),
          headline: cleanHtml(title),
          summary: cleanHtml(description || "").substring(0, 300),
          source: sourceName,
          sourceUrl: link || "",
          publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          category: category,
        });
      }
    }

    return articles.slice(0, 10); // Limit per feed
  } catch (error) {
    console.warn(`Failed to fetch RSS from ${sourceName}: ${error.message}`);
    return [];
  }
}

function extractTag(xml, tag) {
  // Handle both regular tags and CDATA sections
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, "i");
  const normalRegex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");

  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();

  const normalMatch = xml.match(normalRegex);
  return normalMatch ? normalMatch[1].trim() : "";
}

function cleanHtml(text) {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function generateId(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Calculate News Relevance Score (NRS) for an article
 * NRS = (0.35 × recency) + (0.25 × education_overlap) + (0.20 × viral_potential) + (0.20 × audience_relevance)
 */
function calculateNRS(article) {
  // Recency score (0-100): Higher for more recent articles
  const hoursAgo = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
  const recencyScore = Math.max(0, 100 - hoursAgo * 2); // Decays over ~50 hours

  // Education overlap score (0-100): How many education keywords match
  const text = `${article.headline} ${article.summary}`.toLowerCase();
  const matchCount = EDUCATION_KEYWORDS.filter((kw) => text.includes(kw)).length;
  const educationScore = Math.min(100, matchCount * 12);

  // Viral potential score (0-100): Based on headline characteristics
  let viralScore = 30; // Base score
  if (article.headline.includes("?")) viralScore += 15; // Questions engage
  if (/\d/.test(article.headline)) viralScore += 10; // Numbers attract
  if (article.headline.length > 40 && article.headline.length < 80) viralScore += 10;
  if (/breaking|new|first|latest|just|major|shocking/i.test(article.headline)) viralScore += 20;
  if (/how|why|what|explained/i.test(article.headline)) viralScore += 15;
  viralScore = Math.min(100, viralScore);

  // Audience relevance (0-100): Based on category
  const categoryScores = {
    education: 95,
    education_india: 90,
    science: 75,
    technology: 70,
    policy: 80,
    world: 40,
  };
  const audienceScore = categoryScores[article.category] || 50;

  const nrs = Math.round(
    0.35 * recencyScore + 0.25 * educationScore + 0.2 * viralScore + 0.2 * audienceScore
  );

  return {
    nrs: Math.min(100, Math.max(0, nrs)),
    recencyScore: Math.round(recencyScore),
    educationScore: Math.round(educationScore),
    viralScore: Math.round(viralScore),
    audienceScore: Math.round(audienceScore),
  };
}

/**
 * Fetch news from all RSS feeds and score them
 */
export async function fetchEducationNews() {
  const feedPromises = RSS_FEEDS.map((feed) =>
    parseRSSFeed(feed.url, feed.name, feed.category)
  );

  const results = await Promise.allSettled(feedPromises);
  const allArticles = results
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => r.value);

  // Calculate NRS for each article
  const scoredArticles = allArticles.map((article) => {
    const scores = calculateNRS(article);
    return {
      ...article,
      ...scores,
      urgencyWindowHours: scores.nrs > 85 ? 12 : scores.nrs > 70 ? 24 : 48,
      isHighOpportunity: scores.nrs > 85,
    };
  });

  // Sort by NRS descending
  scoredArticles.sort((a, b) => b.nrs - a.nrs);

  // Deduplicate by similar headlines
  const seen = new Set();
  const deduplicated = scoredArticles.filter((article) => {
    const key = article.headline.toLowerCase().substring(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return deduplicated.slice(0, 30);
}

/**
 * Get feed source metadata
 */
export function getNewsSources() {
  return RSS_FEEDS.map((f) => ({ name: f.name, category: f.category }));
}
