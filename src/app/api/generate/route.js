import { NextResponse } from "next/server";
import { generateBundle, generateScript } from "@/lib/ai/writer-agent";
import { generateSEO } from "@/lib/ai/seo-agent";
import { editContent } from "@/lib/ai/editor-agent";

export async function POST(req) {
  try {
    const {
      keyword, format, style, audience, location, research,
      brandVoice,
      bundle = false, bundleFormats = ["instagram_reel", "x_thread", "linkedin_post"]
    } = await req.json();

    if (!keyword) {
      return NextResponse.json({ error: "Missing keyword" }, { status: 400 });
    }

    if (bundle) {
      const rawScripts = await generateBundle({
        keyword, style, audience, research, location, brandVoice,
        formats: bundleFormats
      });
      const optimizedScripts = await Promise.all(
        Object.entries(rawScripts).map(async ([bundleFormat, rawScript]) => {
          const editing = await editContent({
            script: rawScript,
            format: bundleFormat,
            audience,
            research,
          });
          return [bundleFormat, editing?.editedScript || rawScript];
        })
      );
      const scripts = Object.fromEntries(optimizedScripts);

      return NextResponse.json({
        bundle: true,
        scripts,
        metadata: {
          keyword, style, audience, location,
          timestamp: new Date().toISOString()
        }
      });
    }

    // 1. Generate Script
    const script = await generateScript({
      keyword, format, style, audience, research, location, brandVoice
    });

    // 2. Generate SEO
    const seo = await generateSEO({ keyword, format, script, location });

    // 3. Editorial Review
    const editing = await editContent({ script, format, audience, research });

    const finalScript = editing?.editedScript || script;

    return NextResponse.json({
      script: finalScript,
      originalScript: script,
      seo,
      editing,
      metadata: {
        keyword, format, style, audience, location,
        hasResearchContext: !!research,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
