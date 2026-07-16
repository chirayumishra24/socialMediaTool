import { NextResponse } from "next/server";
import { scrapeProfile, buildManualProfile } from "@/lib/crawlers/profile-scraper";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Setup global server-side cache for Chrome extension syncs
if (!global.igCache) {
  global.igCache = {};
}

// CORS Helper headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle OPTIONS preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
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
        console.log(`[IG Sync] Successfully cached profile for @${username} via Chrome Extension`);
      }
      return NextResponse.json(
        { ok: true, cached: true, ...data }, 
        { headers: corsHeaders }
      );
    }

    // Mode B: Dashboard requesting profile info
    const { username } = body;
    if (!username || typeof username !== "string" || !username.trim()) {
      return NextResponse.json({ error: "Username is required" }, { status: 400, headers: corsHeaders });
    }

    const cleanUsername = username.toLowerCase().trim();

    // Check if the Chrome extension recently synced this profile
    if (global.igCache[cleanUsername]) {
      const cachedData = global.igCache[cleanUsername];
      console.log(`[IG Sync] Returning cached data for @${cleanUsername}`);
      return NextResponse.json(
        { ok: true, ...cachedData, source: "Chrome Extension" }, 
        { headers: corsHeaders }
      );
    }

    // Otherwise, try auto-scraping (with free/unsubscribed fallback warning)
    const data = await scrapeProfile(cleanUsername);
    return NextResponse.json({ ok: true, ...data }, { headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Profile scrape failed";
    return NextResponse.json({ error: message }, { status: 500, headers: corsHeaders });
  }
}
