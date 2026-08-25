import { NextResponse } from "next/server";
import { fetchInstagramProfileFromMeta, getInstagramSyncStatus } from "@/lib/meta/instagram";
import { buildManualProfile } from "@/lib/crawlers/profile-scraper";
import fs from "fs";
import path from "path";
import { resolveAccountId } from "@/lib/accounts";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// CORS Helper headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Log helper to write to a local file in the workspace (only in development)
function writeDebugLog(message, data = null) {
  if (process.env.NODE_ENV !== "development") return;
  try {
    const logFilePath = path.join(process.cwd(), "route_logs.txt");
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
    const body = await req.json().catch(() => ({}));
    writeDebugLog("Received POST request", body);

    const { username, manual, accountId: rawAccountId } = body;
    const accountId = resolveAccountId(rawAccountId);

    // Manual / Chrome-extension stats. This is the recovery path when the Meta
    // lookup cannot resolve the profile — without it the analyzer has no way to
    // obtain real numbers, and every strategy is built on an empty account.
    if (manual && typeof manual === "object") {
      writeDebugLog("Building profile from manually supplied stats", manual);
      const built = buildManualProfile(manual);

      if (!built.profile.username) {
        return NextResponse.json(
          { ok: false, error: "Username is required in the manual stats" },
          { status: 400, headers: corsHeaders }
        );
      }

      return NextResponse.json(
        { ok: true, ...built, dataSource: built.source },
        { headers: corsHeaders }
      );
    }

    writeDebugLog(`Dashboard requested username: "${username}"`);

    if (!username || typeof username !== "string" || !username.trim()) {
      return NextResponse.json({ ok: false, error: "Username is required" }, { status: 400, headers: corsHeaders });
    }

    const cleanUsername = username.toLowerCase().trim();
    writeDebugLog(`Cleaned username: "${cleanUsername}"`);

    // Try fetching from official Meta API if credentials are ready
    let metaFailureReason = "";
    try {
      const syncStatus = await getInstagramSyncStatus(accountId);
      if (syncStatus.ready) {
        writeDebugLog(`Meta credentials are ready. Fetching profile for @${cleanUsername} from Meta API...`);
        const metaData = await fetchInstagramProfileFromMeta(cleanUsername, accountId);
        writeDebugLog(`Successfully retrieved @${cleanUsername} from Meta Graph API`);
        return NextResponse.json(
          { ok: true, ...metaData, dataSource: "meta_graph_api" },
          { headers: corsHeaders }
        );
      }
      metaFailureReason = `Meta not connected for ${accountId}: ${(syncStatus.missing || []).join(", ") || "no account linked"}`;
    } catch (metaErr) {
      writeDebugLog(`Meta Graph API lookup skipped/failed: ${metaErr.message}`);
      metaFailureReason = metaErr.message;
    }

    // Since cache missed and Meta API couldn't resolve it, return manual input/extension sync fallback response
    writeDebugLog(`Cache miss for "${cleanUsername}" and Meta API unavailable/skipped. Requesting manual input fallback.`);
    return NextResponse.json({
      ok: true,
      profile: {
        username: cleanUsername,
        fullName: "",
        bio: "",
        followers: 0,
        following: 0,
        postCount: 0,
        profilePic: "",
        isVerified: false,
        externalUrl: "",
        category: "",
      },
      posts: [],
      needsManualInput: true,
      dataSource: "none",
      // Every number above is a zero placeholder, not a measurement. Callers
      // must not generate a strategy from this payload — see the guard in
      // /api/meta/instagram/analyze.
      reason: metaFailureReason || "Instagram APIs unavailable.",
      message: "Instagram APIs unavailable. Sync your stats via the Chrome Extension, or enter them manually.",
    }, { headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Profile scrape failed";
    writeDebugLog(`Error in POST route: ${message}`);
    return NextResponse.json({ ok: false, error: message }, { status: 500, headers: corsHeaders });
  }
}
