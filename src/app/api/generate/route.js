import { NextResponse } from "next/server";
import { generateScript } from "@/lib/ai/writer-agent";
import { editContent } from "@/lib/ai/editor-agent";
import { generateSEO } from "@/lib/ai/seo-agent";

export async function POST(request) {
  try {
    const body = await request.json();
    const { keyword, format = "youtube_long", style = "professional", audience = "general audience", research = null, approvedAngles = [], location = "IN", language = "en", platforms = ["youtube"], brandVoice = null } = body;

    if (!keyword) return NextResponse.json({ error: "Missing keyword" }, { status: 400 });

    // Step 1: Writer Agent → generate raw script
    const rawScript = await generateScript({ keyword, format, style, audience, research, approvedAngles, location, language, brandVoice });

    // Step 2: Editor Agent → polish and score
    const edited = await editContent(rawScript, { format, audience });

    // Step 3: SEO Agent → precision tags and metadata
    const seo = await generateSEO({ keyword, script: edited.editedScript || rawScript, format, location, language, platforms });

    return NextResponse.json({
      script: edited.editedScript || rawScript,
      rawScript,
      editing: {
        hookScore: edited.hookScore,
        ctaStrength: edited.ctaStrength,
        readabilityScore: edited.readabilityScore,
        overallScore: edited.overallScore,
        retentionLoops: edited.retentionLoops,
        changes: edited.changes,
      },
      seo,
      metadata: {
        keyword, format, style, audience, location, language,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Generate API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
