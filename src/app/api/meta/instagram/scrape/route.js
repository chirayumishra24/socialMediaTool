import { NextResponse } from "next/server";
import { scrapeProfile, buildManualProfile } from "@/lib/crawlers/profile-scraper";
import fs from "fs";
import path from "path";

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

// Log helper to write to a local file in the workspace
function writeDebugLog(message, data = null) {
  try {
    const logFilePath = "e:/skilizee/ai-agent/route_logs.txt";
    const timestamp = new Date().toISOString();
    const formattedData = data ? JSON.stringify(data, null, 2) : "";
    const logMessage = `[${timestamp}] ${message}\n${formattedData}\n\n`;
    fs.appendFileSync(logFilePath, logMessage, "utf8");
  } catch (err) {
    console.error("Failed to write debug log file:", err);
  }
}

// Handle OPTIONS preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const body = await req.json();
    writeDebugLog("Received POST request", body);

    // Mode A: Chrome Extension uploading scraped profile payload
    if (body.manual) {
      const data = buildManualProfile(body.manual);
      const username = String(body.manual.profile?.username || body.manual.username || "").toLowerCase().trim();
      
      writeDebugLog(`Extracted username: "${username}" from manual payload`);
      
      if (username) {
        global.igCache[username] = {
          ...data,
          syncedAt: new Date().toISOString()
        };
        writeDebugLog(`Successfully cached in global.igCache under key: "${username}"`, global.igCache[username]);
      }
      return NextResponse.json(
        { ok: true, cached: true, ...data }, 
        { headers: corsHeaders }
      );
    }

    // Mode B: Dashboard requesting profile info
    const { username } = body;
    writeDebugLog(`Dashboard requested username: "${username}"`);
    
    if (!username || typeof username !== "string" || !username.trim()) {
      return NextResponse.json({ error: "Username is required" }, { status: 400, headers: corsHeaders });
    }

    const cleanUsername = username.toLowerCase().trim();
    writeDebugLog(`Cleaned username: "${cleanUsername}"`);
    writeDebugLog("Current global.igCache keys:", Object.keys(global.igCache));

    // Check if the Chrome extension recently synced this profile
    if (global.igCache[cleanUsername]) {
      const cachedData = global.igCache[cleanUsername];
      writeDebugLog(`Cache hit for "${cleanUsername}"`);
      return NextResponse.json(
        { ok: true, ...cachedData, source: "Chrome Extension" }, 
        { headers: corsHeaders }
      );
    }

    // Otherwise, try auto-scraping (with free/unsubscribed fallback warning)
    writeDebugLog(`Cache miss for "${cleanUsername}". Attempting scrapeProfile...`);
    const data = await scrapeProfile(cleanUsername);
    writeDebugLog(`scrapeProfile result for "${cleanUsername}":`, data);
    return NextResponse.json({ ok: true, ...data }, { headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Profile scrape failed";
    writeDebugLog(`Error in POST route: ${message}`);
    return NextResponse.json({ error: message }, { status: 500, headers: corsHeaders });
  }
}
