/**
 * SkilizeeAI — Research Agent (2026 Edition)
 * Deep topic R&D focused on CURRENT 2026 trends, news, and signals.
 */

import { generateJSON } from "./ai-client";

const STOPWORDS = new Set([
  "about", "after", "also", "amid", "among", "and", "are", "because", "been", "being",
  "best", "between", "but", "can", "changes", "could", "from", "have", "into", "just",
  "latest", "more", "most", "news", "over", "really", "search", "should", "still",
  "than", "that", "their", "them", "then", "there", "these", "they", "this", "those",
  "through", "today", "topic", "trends", "very", "what", "when", "where", "which",
  "while", "with", "would", "year", "your", "2025", "2026",
]);

export async function runResearch(keyword, { location = "IN", language = "en", platformData = {}, depth = "deep" } = {}) {
  const cleanedKeyword = normalizeKeyword(keyword);
  const today = new Date().toISOString().split("T")[0];
  const topicSnapshot = buildTopicSnapshot(cleanedKeyword, platformData);
  const evidenceSummary = formatEvidenceForPrompt(topicSnapshot.sourceEvidence);

  const prompt = `You are an elite Content Intelligence Analyst operating in April 2026.

CRITICAL: Today's date is ${today}. ALL analysis must reflect the CURRENT 2026 landscape.
- Reference only 2025-2026 data, trends, algorithm changes, and cultural shifts.
- Do NOT reference outdated 2023-2024 trends as if they are current.
- Mention specific recent events, policy changes, or viral moments from early-to-mid 2026.

TASK: Conduct a ${depth.toUpperCase()}-level research analysis for the EXACT searched topic: "${cleanedKeyword}"

NON-NEGOTIABLE RELEVANCE RULES:
- Stay tightly anchored to the searched topic. Do not drift into adjacent education, AI, or marketing topics unless you explicitly connect them back to "${cleanedKeyword}".
- Every section must explain why the insight matters for this searched topic specifically.
- If live crawl evidence is thin or noisy, say that clearly instead of hallucinating confidence.
- Use the live crawl evidence first. Only use background knowledge to extend or interpret what the evidence suggests.

STEP 0: VAGUE CHECK
If the keyword is too broad (e.g., "AI", "Marketing"), return ONLY:
{ "isVague": true, "message": "Too broad for precise strategy.", "suggestions": ["specific version 1", "specific version 2", "specific version 3"] }

STEP 1: FULL ANALYSIS (if not vague)

CONTEXT:
- Location Focus: ${location}
- Language: ${language}
- Analysis Date: ${today}

SEARCH TOPIC SNAPSHOT:
${formatTopicSnapshotForPrompt(topicSnapshot)}

REAL-TIME TOPIC EVIDENCE (crawled just now):
${evidenceSummary || "No strong live evidence found. Be explicit about low evidence confidence and keep the analysis tightly scoped to the searched topic."}

Return this JSON structure:
{
  "keyword": "${cleanedKeyword}",
  "isVague": false,
  "executiveSummary": "3-5 sentences summarizing what matters most for this exact searched topic right now.",
  "topicFocus": {
    "interpretedTopic": "the exact subtopic you believe the user means",
    "whyNow": "why this topic matters right now in 2026",
    "audienceLens": "who cares most about this topic",
    "geoLens": "how location changes the take, if at all"
  },
  "relevanceCheck": {
    "score": 0-100,
    "verdict": "high_fit|medium_fit|low_fit",
    "explanation": "1-2 sentences on how closely the evidence matches the searched topic",
    "offTopicRisks": ["possible ambiguity or adjacent-topic risks"]
  },
  "sourceEvidence": [
    {
      "platform": "youtube|instagram|x|reddit|news",
      "title": "specific item title",
      "publishedAt": "date or relative date",
      "engagementHint": "why it stands out numerically",
      "whyItMatters": "how it directly connects to the searched topic"
    }
  ],
  "marketLandscape": {
    "saturationLevel": "low|medium|high|oversaturated",
    "saturationScore": 0-100,
    "totalEstimatedContent": "e.g. 50K+ videos",
    "growthTrend": "rising|stable|declining",
    "summary": "2-3 sentences about the CURRENT 2026 landscape for this topic. Reference specific recent developments."
  },
  "audienceSentiment": {
    "overall": "positive|negative|mixed|neutral",
    "score": 0-100,
    "painPoints": ["5 specific, actionable pain points people have RIGHT NOW in 2026"],
    "desires": ["5 specific desires/aspirations"],
    "demographics": "primary audience description with 2026 context"
  },
  "contentGaps": [
    {
      "gap": "specific underserved angle",
      "opportunity": "why this is a golden opportunity in 2026",
      "difficulty": "easy|medium|hard",
      "estimatedDemand": "high|medium|low"
    }
  ],
  "trendingAngles": [
    {
      "angle": "specific 2026-relevant angle title",
      "description": "why this is trending NOW",
      "platforms": ["youtube", "instagram", "x"],
      "viralPotential": 0-100,
      "suggestedFormat": "youtube_long|youtube_short|reel|carousel|thread|blog",
      "hookIdea": "compelling hook idea"
    }
  ],
  "suggestedAngles": ["3-5 sharp angle titles that stay on-topic"],
  "suggestedHooks": ["3-5 hooks that directly mention the searched topic or audience pain point"],
  "strategyBlueprint": {
    "concept": "The high-level content pillar rooted in 2026 reality",
    "executionPhases": ["Phase 1: ...", "Phase 2: ...", "Phase 3: ..."],
    "modernApproach": "Why this works specifically in the current 2026 algorithm + cultural landscape",
    "recommendedTools": ["Tool 1", "Tool 2"]
  },
  "recommendedStrategy": {
    "bestPlatform": "youtube|instagram|x|linkedin|blog",
    "bestFormat": "format name",
    "bestAngle": "the single strongest angle for 2026",
    "estimatedViralPotential": 0-100,
    "keyMessage": "core message in 1 sentence"
  }
}

Return ONLY valid JSON.
Be hyper-specific.
Tie every recommendation back to "${cleanedKeyword}".
If evidence is mixed, say exactly where it is mixed.`;

  const raw = await generateJSON(prompt, depth === "quick" ? "flash" : "pro");
  return normalizeResearch(cleanedKeyword, raw, topicSnapshot);
}

function normalizeResearch(keyword, raw, topicSnapshot) {
  if (raw?.isVague) {
    return {
      keyword,
      isVague: true,
      message: raw.message || "Too broad for precise strategy.",
      suggestions: normalizeSuggestions(raw.suggestions, keyword),
    };
  }

  const trendingAngles = Array.isArray(raw?.trendingAngles) ? raw.trendingAngles.filter(Boolean) : [];
  const fallbackAngles = topicSnapshot.sourceEvidence.slice(0, 3).map((item) => ({
    angle: item.title,
    description: item.whyItMatters,
    platforms: [item.platform],
    viralPotential: Math.max(55, item.relevanceScore),
    suggestedFormat: "youtube_short",
    hookIdea: `Why is everyone suddenly talking about ${keyword}?`,
  }));
  const finalAngles = trendingAngles.length ? trendingAngles : fallbackAngles;

  const suggestedAngles = Array.isArray(raw?.suggestedAngles) && raw.suggestedAngles.length
    ? raw.suggestedAngles
    : finalAngles.map((angle) => angle.angle).filter(Boolean).slice(0, 5);

  const suggestedHooks = Array.isArray(raw?.suggestedHooks) && raw.suggestedHooks.length
    ? raw.suggestedHooks
    : finalAngles.map((angle) => angle.hookIdea).filter(Boolean).slice(0, 5);

  const sourceEvidence = Array.isArray(raw?.sourceEvidence) && raw.sourceEvidence.length
    ? raw.sourceEvidence.slice(0, 6).map((item, index) => normalizeEvidenceItem(item, topicSnapshot.sourceEvidence[index]))
    : topicSnapshot.sourceEvidence;

  const relevanceScore = clampNumber(
    raw?.relevanceCheck?.score ?? deriveRelevanceScore(topicSnapshot),
    0,
    100
  );

  return {
    keyword,
    isVague: false,
    executiveSummary: raw?.executiveSummary || buildExecutiveSummary(keyword, raw, topicSnapshot),
    topicFocus: {
      interpretedTopic: raw?.topicFocus?.interpretedTopic || keyword,
      whyNow: raw?.topicFocus?.whyNow || `${keyword} is showing active discussion in current platform coverage and needs a topic-specific content angle.`,
      audienceLens: raw?.topicFocus?.audienceLens || raw?.audienceSentiment?.demographics || "Decision-makers and active audience segments closest to the topic.",
      geoLens: raw?.topicFocus?.geoLens || "Use local context only when it materially changes demand, regulation, or audience behavior.",
    },
    relevanceCheck: {
      score: relevanceScore,
      verdict: raw?.relevanceCheck?.verdict || deriveVerdict(relevanceScore),
      explanation: raw?.relevanceCheck?.explanation || topicSnapshot.relevanceSummary,
      offTopicRisks: Array.isArray(raw?.relevanceCheck?.offTopicRisks) ? raw.relevanceCheck.offTopicRisks : [],
    },
    sourceEvidence,
    marketLandscape: {
      saturationLevel: raw?.marketLandscape?.saturationLevel || "medium",
      saturationScore: clampNumber(raw?.marketLandscape?.saturationScore ?? 60, 0, 100),
      totalEstimatedContent: raw?.marketLandscape?.totalEstimatedContent || "Signal still emerging",
      growthTrend: raw?.marketLandscape?.growthTrend || "rising",
      summary: raw?.marketLandscape?.summary || topicSnapshot.relevanceSummary,
    },
    audienceSentiment: {
      overall: raw?.audienceSentiment?.overall || "mixed",
      score: clampNumber(raw?.audienceSentiment?.score ?? 60, 0, 100),
      painPoints: ensureArray(raw?.audienceSentiment?.painPoints, [
        `People searching ${keyword} want concrete, current information rather than broad commentary.`,
      ], 5),
      desires: ensureArray(raw?.audienceSentiment?.desires, [
        `Clear, current answers tied directly to ${keyword}.`,
      ], 5),
      demographics: raw?.audienceSentiment?.demographics || "Audience most affected by the topic, including researchers, buyers, operators, or parents depending on the query.",
    },
    contentGaps: ensureObjectArray(raw?.contentGaps, {
      gap: `Explain ${keyword} with fresher evidence and clearer specificity.`,
      opportunity: "Most content stays broad; topic-specific synthesis is the opening.",
      difficulty: "medium",
      estimatedDemand: "medium",
    }, 4),
    trendingAngles: finalAngles.slice(0, 5),
    suggestedAngles,
    suggestedHooks,
    strategyBlueprint: {
      concept: raw?.strategyBlueprint?.concept || `Own the most useful current narrative around ${keyword}.`,
      executionPhases: ensureArray(raw?.strategyBlueprint?.executionPhases, [
        `Phase 1: Clarify what ${keyword} means right now.`,
        "Phase 2: Publish evidence-backed breakdowns with platform-native hooks.",
        "Phase 3: Double down on the strongest audience response loop.",
      ], 4),
      modernApproach: raw?.strategyBlueprint?.modernApproach || "Current audiences reward specific, evidence-backed takes over generic explainers.",
      recommendedTools: ensureArray(raw?.strategyBlueprint?.recommendedTools, ["Google Trends", "YouTube", "Reddit"], 5),
    },
    recommendedStrategy: {
      bestPlatform: raw?.recommendedStrategy?.bestPlatform || inferBestPlatform(sourceEvidence),
      bestFormat: raw?.recommendedStrategy?.bestFormat || "youtube_short",
      bestAngle: raw?.recommendedStrategy?.bestAngle || suggestedAngles[0] || `What changed recently around ${keyword}`,
      estimatedViralPotential: clampNumber(raw?.recommendedStrategy?.estimatedViralPotential ?? 68, 0, 100),
      keyMessage: raw?.recommendedStrategy?.keyMessage || `Be precise: explain what is happening with ${keyword}, why it matters now, and what people should do next.`,
    },
  };
}

function fmtNum(n) {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function normalizeKeyword(keyword) {
  return String(keyword || "").trim().replace(/\s+/g, " ");
}

function buildTopicSnapshot(keyword, platformData) {
  const queryTerms = getQueryTerms(keyword);
  const entries = collectEntries(platformData).map((entry) => ({
    ...entry,
    relevanceScore: scoreEntry(entry, keyword, queryTerms),
  }));

  const sourceEvidence = entries
    .filter((entry) => entry.relevanceScore > 0)
    .sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) return b.relevanceScore - a.relevanceScore;
      return (b.signalStrength || 0) - (a.signalStrength || 0);
    })
    .slice(0, 6)
    .map((entry) => ({
      platform: entry.platform,
      title: entry.title,
      publishedAt: entry.publishedAt || "recent",
      engagementHint: describeEngagement(entry),
      whyItMatters: buildWhyItMatters(entry, keyword, queryTerms),
      url: entry.url,
      relevanceScore: entry.relevanceScore,
    }));

  const platformCounts = sourceEvidence.reduce((acc, item) => {
    acc[item.platform] = (acc[item.platform] || 0) + 1;
    return acc;
  }, {});

  const strongMatchCount = entries.filter((entry) => entry.relevanceScore >= 60).length;
  const relevanceSummary = sourceEvidence.length
    ? `Live crawl found ${sourceEvidence.length} strong signals tied to "${keyword}" across ${Object.keys(platformCounts).join(", ")}.`
    : `Live crawl returned limited direct signals for "${keyword}", so confidence should stay moderate until stronger topic-matched evidence appears.`;

  return {
    keyword,
    queryTerms,
    sourceEvidence,
    strongMatchCount,
    totalSignals: entries.length,
    platformCounts,
    relevanceSummary,
  };
}

function formatTopicSnapshotForPrompt(snapshot) {
  const platformLine = Object.entries(snapshot.platformCounts)
    .map(([platform, count]) => `${platform}: ${count}`)
    .join(", ");

  return [
    `- Query terms: ${snapshot.queryTerms.join(", ") || "none"}`,
    `- Strong topic matches: ${snapshot.strongMatchCount}`,
    `- Total crawled signals considered: ${snapshot.totalSignals}`,
    `- Platform coverage: ${platformLine || "none"}`,
    `- Relevance summary: ${snapshot.relevanceSummary}`,
  ].join("\n");
}

function formatEvidenceForPrompt(evidence) {
  return evidence.map((item) =>
    `- [${item.platform.toUpperCase()}] "${item.title}" | ${item.engagementHint} | ${item.publishedAt} | Why it matters: ${item.whyItMatters}`
  ).join("\n");
}

function collectEntries(platformData) {
  return [
    ...(platformData.youtube || []).map((item) => ({
      platform: "youtube",
      title: item.title || "",
      description: item.description || "",
      url: item.url,
      publishedAt: item.publishedAt,
      signalStrength: Number(item.metrics?.views || 0) + Number(item.metrics?.likes || 0) * 20,
      metrics: item.metrics || {},
    })),
    ...(platformData.instagram || []).map((item) => ({
      platform: "instagram",
      title: item.title || item.description || "",
      description: item.description || "",
      url: item.url || item.videoUrl,
      publishedAt: item.publishedAt,
      signalStrength: Number(item.metrics?.likes || 0) * 20 + Number(item.metrics?.comments || 0) * 30,
      metrics: item.metrics || {},
    })),
    ...(platformData.reddit || []).map((item) => ({
      platform: "reddit",
      title: item.title || "",
      description: item.description || item.subreddit || "",
      url: item.url,
      publishedAt: item.publishedAt,
      signalStrength: Number(item.metrics?.likes || 0) * 20 + Number(item.metrics?.comments || 0) * 15,
      metrics: item.metrics || {},
    })),
    ...(platformData.x || []).map((item) => ({
      platform: "x",
      title: item.title || item.description || "",
      description: item.description || "",
      url: item.url,
      publishedAt: item.publishedAt,
      signalStrength: Number(item.metrics?.likes || 0) * 20 + Number(item.metrics?.retweets || 0) * 30,
      metrics: item.metrics || {},
    })),
    ...(platformData.news || []).map((item) => ({
      platform: "news",
      title: item.title || "",
      description: item.description || item.author || "",
      url: item.url,
      publishedAt: item.publishedAt,
      signalStrength: 100,
      metrics: item.metrics || {},
    })),
  ].filter((entry) => entry.title);
}

function scoreEntry(entry, keyword, queryTerms) {
  const haystack = `${entry.title} ${entry.description}`.toLowerCase();
  let score = 0;

  if (haystack.includes(keyword.toLowerCase())) score += 65;
  queryTerms.forEach((term) => {
    if (haystack.includes(term)) score += 15;
  });

  if (entry.platform === "news") score += 8;
  if (entry.publishedAt && /(2026|2025)/.test(String(entry.publishedAt))) score += 6;
  return Math.min(100, score);
}

function buildWhyItMatters(entry, keyword, queryTerms) {
  const matchedTerms = queryTerms.filter((term) => `${entry.title} ${entry.description}`.toLowerCase().includes(term));
  const matchText = matchedTerms.length ? `It directly references ${matchedTerms.join(", ")}.` : `It sits close to the searched topic "${keyword}".`;
  return `${matchText} ${describeEngagement(entry)}.`;
}

function describeEngagement(entry) {
  const metrics = entry.metrics || {};
  if (entry.platform === "youtube") {
    return `${fmtNum(metrics.views)} views and ${fmtNum(metrics.likes)} likes`;
  }
  if (entry.platform === "instagram") {
    return `${fmtNum(metrics.likes)} likes and ${fmtNum(metrics.comments)} comments`;
  }
  if (entry.platform === "reddit") {
    return `${fmtNum(metrics.likes)} upvotes and ${fmtNum(metrics.comments)} comments`;
  }
  if (entry.platform === "x") {
    return `${fmtNum(metrics.likes)} likes and ${fmtNum(metrics.retweets)} reposts`;
  }
  return "recent coverage";
}

function getQueryTerms(keyword) {
  return normalizeKeyword(keyword)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((term) => term.length > 2 && !STOPWORDS.has(term));
}

function normalizeSuggestions(suggestions, keyword) {
  const cleaned = Array.isArray(suggestions) ? suggestions.filter(Boolean).slice(0, 5) : [];
  if (cleaned.length) return cleaned;
  return [
    `${keyword} for schools`,
    `${keyword} latest 2026 changes`,
    `${keyword} strategy for India`,
  ];
}

function buildExecutiveSummary(keyword, raw, topicSnapshot) {
  const bestAngle = raw?.recommendedStrategy?.bestAngle || raw?.strategyBlueprint?.concept || keyword;
  const trend = raw?.marketLandscape?.growthTrend || "rising";
  return `${bestAngle} is the clearest opening around "${keyword}" right now. The live crawl suggests ${trend} attention, with the strongest signals coming from ${Object.keys(topicSnapshot.platformCounts).join(", ") || "current platform chatter"}. The opportunity is to publish something more precise and evidence-backed than the generic content already in market.`;
}

function ensureArray(value, fallback, max = 5) {
  if (Array.isArray(value) && value.length) return value.slice(0, max);
  return fallback.slice(0, max);
}

function ensureObjectArray(value, fallbackObject, max = 4) {
  if (Array.isArray(value) && value.length) return value.slice(0, max);
  return [fallbackObject];
}

function normalizeEvidenceItem(item, fallback) {
  return {
    platform: item?.platform || fallback?.platform || "news",
    title: item?.title || fallback?.title || "Untitled signal",
    publishedAt: item?.publishedAt || fallback?.publishedAt || "recent",
    engagementHint: item?.engagementHint || fallback?.engagementHint || "active discussion",
    whyItMatters: item?.whyItMatters || fallback?.whyItMatters || "It is relevant to the searched topic.",
    url: item?.url || fallback?.url,
    relevanceScore: clampNumber(item?.relevanceScore ?? fallback?.relevanceScore ?? 65, 0, 100),
  };
}

function deriveRelevanceScore(topicSnapshot) {
  if (!topicSnapshot.sourceEvidence.length) return 42;
  const total = topicSnapshot.sourceEvidence.reduce((sum, item) => sum + Number(item.relevanceScore || 0), 0);
  return Math.round(total / topicSnapshot.sourceEvidence.length);
}

function deriveVerdict(score) {
  if (score >= 80) return "high_fit";
  if (score >= 55) return "medium_fit";
  return "low_fit";
}

function inferBestPlatform(sourceEvidence) {
  const counts = sourceEvidence.reduce((acc, item) => {
    acc[item.platform] = (acc[item.platform] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "youtube";
}

function clampNumber(value, min, max) {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return min;
  return Math.min(max, Math.max(min, numeric));
}
