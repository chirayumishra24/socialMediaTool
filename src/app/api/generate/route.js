import { NextResponse } from "next/server";
import { generateScript } from "@/lib/ai/writer-agent";
import { generateSEO } from "@/lib/ai/seo-agent";
import { editContent } from "@/lib/ai/editor-agent";

export async function POST(req) {
  try {
    const { 
      keyword, format, style, audience, location, research, 
      brandVoice, directorPersona, schoolContext 
    } = await req.json();

    // 1. Generate Script
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
