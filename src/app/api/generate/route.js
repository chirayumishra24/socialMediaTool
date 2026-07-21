import { NextResponse } from "next/server";
import { generateBundle, generateScript } from "@/lib/ai/writer-agent";
import { generateSEO } from "@/lib/ai/seo-agent";
import { editContent } from "@/lib/ai/editor-agent";

export const maxDuration = 300;

export async function POST(req) {
  try {
    const {
      keyword, format, style, audience, location, research,
      brandVoice, performanceData,
      bundle = false, bundleFormats = ["instagram_reel", "x_thread", "linkedin_post"]
    } = await req.json();

    if (!keyword) {
      return NextResponse.json({ error: "Missing keyword" }, { status: 400 });
    }


    if (bundle) {
      const rawScripts = await generateBundle({
        keyword, style, audience, research, location, brandVoice, performanceData,
        formats: bundleFormats,
      });
      const optimizedScripts = await Promise.all(
        Object.entries(rawScripts).map(async ([bundleFormat, rawScript]) => {
          try {
            const editing = await editContent({
              script: rawScript,
              format: bundleFormat,
              audience,
              research,
              tier: "flash",
            });
            return [bundleFormat, editing?.editedScript || rawScript];
          } catch (error) {
            console.warn(`Bundle edit failed for ${bundleFormat}:`, error.message);
            return [bundleFormat, rawScript];
          }
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
      keyword, format, style, audience, research, location, brandVoice, performanceData
    });

    // 2. Run supporting AI work in parallel and fail open if either step breaks.
    const [seoResult, editingResult] = await Promise.allSettled([
      generateSEO({ keyword, format, script, location, tier: "flash" }),
      editContent({ script, format, audience, research, tier: "flash" }),
    ]);

    const seo = seoResult.status === "fulfilled" ? seoResult.value : null;
    const editing = editingResult.status === "fulfilled" ? editingResult.value : null;
    const partialFailures = [];
    if (seoResult.status === "rejected") {
      console.warn("SEO generation failed:", seoResult.reason?.message || seoResult.reason);
      partialFailures.push("seo");
    }
    if (editingResult.status === "rejected") {
      console.warn("Editorial review failed:", editingResult.reason?.message || editingResult.reason);
      partialFailures.push("editing");
    }

    const finalScript = editing?.editedScript || script;

    return NextResponse.json({
      script: finalScript,
      originalScript: script,
      seo,
      editing,
      metadata: {
        keyword, format, style, audience, location,
        hasResearchContext: !!research,
        partialFailures,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
