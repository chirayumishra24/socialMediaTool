import { NextResponse } from "next/server";
import { generateBundle, generateScript } from "@/lib/ai/writer-agent";
import { generateSEO } from "@/lib/ai/seo-agent";
import { editContent } from "@/lib/ai/editor-agent";

export async function POST(req) {
  try {
    const { 
      keyword, format, style, audience, location, research, 
      brandVoice, directorPersona, schoolContext,
      learningSignals,
      bundle = false, bundleFormats = ["instagram_reel", "x_thread", "linkedin_post"]
    } = await req.json();

    if (!keyword) {
      return NextResponse.json({ error: "Missing keyword" }, { status: 400 });
    }

    if (bundle) {
      const scripts = await generateBundle({
        keyword, style, audience, research, location, 
        brandVoice, directorPersona, schoolContext, learningSignals,
        formats: bundleFormats
      });

      return NextResponse.json({
        bundle: true,
        scripts,
        metadata: {
          keyword, style, audience, location, 
          directorPersona,
          timestamp: new Date().toISOString()
        }
      });
    }

    // 1. Generate Single Script
    const script = await generateScript({
      keyword, format, style, audience, research, location, 
      brandVoice, directorPersona, schoolContext, learningSignals
    });

    // 2. Generate SEO Bundle
    const seo = await generateSEO({
      keyword, format, script, location, learningSignals
    });

    // 3. Editorial Review
    const editing = await editContent({
      script, format, audience
    });

    const finalScript = editing?.editedScript || script;

    return NextResponse.json({
      script: finalScript,
      originalScript: script,
      seo,
      editing,
      metadata: {
        keyword, format, style, audience, location, 
        directorPersona,
        hasResearchContext: !!research,
        usedLearningSignals: !!learningSignals?.publishedPosts,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
