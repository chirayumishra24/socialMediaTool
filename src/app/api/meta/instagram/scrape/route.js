import { NextResponse } from "next/server";
import { scrapeProfile, buildManualProfile } from "@/lib/crawlers/profile-scraper";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Setup global server-side cache for Chrome extension syncs
if (!global.igCache) {
  global.igCache = {};
}

export async function POST(req) {
  try {
    const body = await req.json();

    // Mode A: Chrome Extension uploading scraped profile payload
    if (body.manual) {
      const data = buildManualProfile(body.manual);
      const username = String(body.manual.username || "").toLowerCase().trim();
      if (username) {
        global.igCache[username] = {
          ...data,
          syncedAt: new Date().toISOString()
        };
      }
      return NextResponse.json({ ok: true, cached: true, ...data });
    }

    // Mode B: Dashboard requesting profile info
    const { username } = body;
    if (!username || typeof username !== "string" || !username.trim()) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const cleanUsername = username.toLowerCase().trim();

    // Check if the Chrome extension recently synced this profile
    if (global.igCache[cleanUsername]) {
      const cachedData = global.igCache[cleanUsername];
      // Optional: clear cache after reading if you want one-time sync
      // delete global.igCache[cleanUsername];
      return NextResponse.json({ ok: true, ...cachedData, source: "Chrome Extension" });
    }

    // Otherwise, try auto-scraping (with free/unsubscribed fallback warning)
    const data = await scrapeProfile(cleanUsername);
    return NextResponse.json({ ok: true, ...data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Profile scrape failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
