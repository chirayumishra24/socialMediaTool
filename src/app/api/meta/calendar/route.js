/**
 * POST /api/meta/calendar — Generate AI content calendar
 * GET  /api/meta/calendar — Retrieve the most recently generated calendar
 *
 * POST body:
 *   { accountId?: string, niche?: string, goals?: string[], postsLimit?: number,
 *     period?: string, startDate?: string, endDate?: string, postsPerWeek?: number }
 *
 * Both verbs return the same envelope and the same calendar shape:
 *   { ok: true, success: true, calendar: object|null }
 * Errors return { ok: false, success: false, error: string }, matching
 * /api/meta/schedule and /api/meta/publish.
 */

import { NextResponse } from "next/server";
import { generateContentCalendar } from "@/lib/ai/calendar-agent";
import { setActiveCalendar } from "@/lib/ai/strategy-context";
import { saveCalendar, loadCalendar } from "@/lib/ai/calendar-store";
import { resolveAccountId } from "@/lib/accounts";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // the full insights → AI pipeline is slow

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));

    const accountId = resolveAccountId(body.accountId);
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

    // Persist durably so GET can serve it after this instance is recycled
    const stored = await saveCalendar(calendar, accountId, options);

    return NextResponse.json({ ok: true, success: true, calendar: stored });
  } catch (err) {
    console.error("[Calendar API] Generation failed:", err);
    return NextResponse.json(
      { ok: false, success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = resolveAccountId(searchParams.get("accountId"));
    const stored = await loadCalendar(accountId);

    if (!stored) {
      return NextResponse.json({
        ok: true,
        success: true,
        calendar: null,
        message: "No calendar generated yet. Use POST to generate one.",
      });
    }

    // Re-seed the in-process strategy context so a strategy generated on this
    // instance still aligns with the calendar the user is looking at.
    setActiveCalendar(stored, accountId);

    return NextResponse.json({ ok: true, success: true, calendar: stored });
  } catch (err) {
    console.error("[Calendar API] Fetch failed:", err);
    return NextResponse.json(
      { ok: false, success: false, error: err.message },
      { status: 500 }
    );
  }
}
