import { NextResponse } from "next/server";
import { scrapeProfile, buildManualProfile } from "@/lib/crawlers/profile-scraper";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req) {
  try {
    const body = await req.json();

    // Manual mode: user provides stats directly
    if (body.manual) {
      const data = buildManualProfile(body.manual);
      return NextResponse.json({ ok: true, ...data });
    }

    // Auto mode: scrape via API
    const { username } = body;
    if (!username || typeof username !== "string" || !username.trim()) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const data = await scrapeProfile(username.trim());
    return NextResponse.json({ ok: true, ...data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Profile scrape failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
