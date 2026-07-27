/**
 * POST /api/meta/calendar — Generate AI content calendar
 * GET  /api/meta/calendar — Retrieve the most recently generated calendar
 *
 * POST body:
 *   { niche?: string, goals?: string[], postsLimit?: number, period?: string }
 */

import { NextResponse } from "next/server";
import { generateContentCalendar } from "@/lib/ai/calendar-agent";

// In-memory cache of the last generated calendar
let lastCalendar = null;

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));

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
    };

    console.log("[Calendar API] Generating calendar with options:", options);
    const calendar = await generateContentCalendar(options);

    // Cache it
    lastCalendar = {
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

export async function GET() {
  if (!lastCalendar) {
    return NextResponse.json({
      success: true,
      calendar: null,
      message: "No calendar generated yet. Use POST to generate one.",
    });
  }

  return NextResponse.json({
    success: true,
    calendar: lastCalendar,
  });
}
