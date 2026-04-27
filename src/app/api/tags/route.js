import { NextResponse } from "next/server";
import { generateSEO } from "@/lib/ai/seo-agent";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("q");
  if (!keyword) return NextResponse.json({ error: "Missing ?q=" }, { status: 400 });

  const format = searchParams.get("format") || "youtube_long";
  const location = searchParams.get("location") || process.env.DEFAULT_REGION || "IN";

  try {
    const seo = await generateSEO({ keyword, format, location, platforms: ["youtube", "instagram", "x"] });
    return NextResponse.json(seo);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
