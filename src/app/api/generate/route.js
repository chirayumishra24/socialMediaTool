import { NextResponse } from "next/server";
import { generateScript } from "@/lib/ai/writer-agent";
import { generateSEO } from "@/lib/ai/seo-agent";
import { editContent } from "@/lib/ai/editor-agent";

export async function POST(req) {
  try {
    const { 
      keyword, format, style, audience, location, research, 
      brandVoice, directorPersona, schoolContext,
      bundle = false, bundleFormats = ["instagram_reel", "x_thread", "linkedin_post"]
    } = await req.json();

    if (bundle) {
      const scripts = await generateBundle({
        keyword, style, audience, research, location, 
        brandVoice, directorPersona, schoolContext,
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
      brandVoice, directorPersona, schoolContext
    });

    // 2. Generate SEO Bundle
    const seo = await generateSEO({
      keyword, format, script
    });

    // 3. Editorial Review
    const editing = await editContent({
      script, format, style, brandVoice
    });

    return NextResponse.json({
      script,
      seo,
      editing,
      metadata: {
        keyword, format, style, audience, location, 
        directorPersona,
        hasResearchContext: !!research,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
