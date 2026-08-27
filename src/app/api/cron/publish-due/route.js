import { NextResponse } from "next/server";
import { checkAndPublishPending, getScheduledPosts } from "@/lib/meta/scheduler";

export const dynamic = "force-dynamic";
// Publishing to Instagram polls container status, so a batch needs headroom.
export const maxDuration = 300;

/**
 * GET /api/cron/publish-due — Publish every scheduled post whose time has come.
 *
 * Scheduling only writes a row to Firestore; something has to come back and
 * publish it. That is this endpoint, driven by the cron entry in vercel.json.
 * Without it, queued posts sit at status "scheduled" forever with no error,
 * which looks exactly like the app silently ignoring them.
 *
 * Auth: Vercel Cron sends `Authorization: Bearer $CRON_SECRET` automatically
 * when that variable is set. A secret is REQUIRED in production — this endpoint
 * posts to live Instagram and Facebook accounts.
 */
export async function GET(req) {
  const secret = process.env.CRON_SECRET;
  const isProd = process.env.NODE_ENV === "production";

  if (secret) {
    const { searchParams } = new URL(req.url);
    const presented =
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      searchParams.get("secret") ||
      "";

    if (presented !== secret) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  } else if (isProd) {
    console.error("[Cron] CRON_SECRET is not set — refusing to publish unauthenticated.");
    return NextResponse.json(
      {
        ok: false,
        error:
          "CRON_SECRET is not configured. Set it in the environment so this endpoint cannot be triggered by anyone who knows the URL.",
      },
      { status: 503 }
    );
  } else {
    console.warn("[Cron] CRON_SECRET is not set — running unauthenticated (development only).");
  }

  try {
    const before = await getScheduledPosts(null);
    const due = before.filter(
      (p) => p.status === "scheduled" && new Date(p.scheduledAt) <= new Date()
    );

    console.log(`[Cron] ${before.length} queued, ${due.length} due for publication.`);
    const executed = await checkAndPublishPending();

    const succeeded = executed.filter((e) => e.success).length;
    const failed = executed.length - succeeded;
    console.log(`[Cron] Published ${succeeded}, failed ${failed}.`);

    return NextResponse.json({
      ok: true,
      queued: before.length,
      due: due.length,
      executedCount: executed.length,
      succeeded,
      failed,
      executed,
    });
  } catch (error) {
    const message = error.message || "Scheduled publication sweep failed";
    console.error("[Cron] Sweep error:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
