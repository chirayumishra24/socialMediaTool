import { NextResponse } from "next/server";
import { generateStrategy } from "@/lib/ai/strategy-agent";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req) {
  try {
    const { profileData, profileContext } = await req.json();

    if (!profileData || !profileData.profile) {
      return NextResponse.json(
        { error: "profileData with profile info is required. Scrape the profile first." },
        { status: 400 }
      );
    }

    const strategy = await generateStrategy(profileData, profileContext || {});

    return NextResponse.json({ ok: true, strategy });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Strategy generation failed";
    console.error("Instagram analyze error:", message);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
