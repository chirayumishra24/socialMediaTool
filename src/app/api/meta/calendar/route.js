/**
 * POST /api/meta/calendar — Generate AI content calendar
 * GET  /api/meta/calendar — Retrieve the most recently generated calendar
 *
 * POST body:
 *   { niche?: string, goals?: string[], postsLimit?: number, period?: string }
 */

import { NextResponse } from "next/server";
import { generateContentCalendar } from "@/lib/ai/calendar-agent";
import { setActiveCalendar } from "@/lib/ai/strategy-context";

// In-memory cache of the last generated calendar per account
let lastCalendars = {};

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));

    const accountId = body.accountId || "skillizee";
    const options = {
      niche: body.niche || "General",
      goals: Array.isArray(body.goals)
        ? body.goals
        : ["Grow followers", "Increase engagement", "Drive traffic"],
      postsLimit: Math.min(Number(body.postsLimit) || 50, 50),
      period: body.period || "days_28",
      startDate: body.startDate || undefined,
      endDate: body.endDate || undefined,
      postsPerWeek: Math.min(Number(body.postsPerWeek) || 5, 7),
      accountId,
    };

    console.log("[Calendar API] Generating calendar with options:", options);
    const calendar = await generateContentCalendar(options);

    // Persist to shared context so the strategy agent can reference it
    setActiveCalendar(calendar, accountId);

    // Cache it
    lastCalendars[accountId] = {
      ...calendar,
      cachedAt: new Date().toISOString(),
      requestOptions: options,
    };

    return NextResponse.json({ success: true, calendar });
  } catch (err) {
    console.error("[Calendar API] Generation failed:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("accountId") || "skillizee";
  const cached = lastCalendars[accountId];

  if (!cached) {
    return NextResponse.json({
      success: true,
      calendar: null,
      message: "No calendar generated yet. Use POST to generate one.",
    });
  }

  return NextResponse.json({
    success: true,
    calendar: cached,
  });
}
