import { generateContent } from "@/lib/agents";
import { seedKnowledgeBase, search } from "@/lib/rag";
import { NextResponse } from "next/server";

export async function POST(request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
    return NextResponse.json(
      { error: "Gemini API key not configured. Add GEMINI_API_KEY to .env.local" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { niche, audience, platform, format, style, trendData, newsData, keywords } = body;

    if (!niche) {
      return NextResponse.json({ error: "Niche/subject is required" }, { status: 400 });
    }

    // RAG: Seed knowledge base on first use, then retrieve relevant context
    let ragContext = "";
    try {
      await seedKnowledgeBase(apiKey);
      const ragResults = await search(apiKey, niche, 3);
      if (ragResults.length > 0) {
        ragContext = "\n\nKNOWLEDGE BASE CONTEXT:\n" +
          ragResults.map((r) => `[Relevance: ${r.relevanceScore}] ${r.text}`).join("\n");
      }
    } catch (ragErr) {
      console.warn("RAG retrieval skipped:", ragErr.message);
    }

    const result = await generateContent(apiKey, {
      niche,
      audience: audience || "students and curious learners",
      platform: platform || "youtube",
      format: format || "youtube_longform",
      style: style || "engaging and conversational",
      trendData: (trendData || "") + ragContext,
      newsData: newsData || "",
      keywords: keywords || "",
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: `Content generation failed: ${error.message}` },
      { status: 500 }
    );
  }
}
