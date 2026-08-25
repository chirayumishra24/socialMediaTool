import { NextResponse } from "next/server";
import {
  schedulePost,
  getScheduledPosts,
  deleteScheduledPost,
  checkAndPublishPending,
} from "@/lib/meta/scheduler";
import { validatePublishPayload } from "@/lib/meta/publisher";
import { resolveAccountId } from "@/lib/accounts";

export const dynamic = "force-dynamic";

/**
 * GET /api/meta/schedule — Returns the list of scheduled posts.
 * Can also be triggered as a cron ping to check and publish pending posts via ?check=true query.
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const runCheck = searchParams.get("check") === "true";
    const accountId = resolveAccountId(searchParams.get("accountId"));

    if (runCheck) {
      console.log("[Scheduler API] Running check for pending scheduled posts...");
      const executed = await checkAndPublishPending();
      return NextResponse.json({ ok: true, executedCount: executed.length, executed });
    }

    const posts = await getScheduledPosts(accountId);
    return NextResponse.json({ ok: true, posts });
  } catch (error) {
    const message = error.message || "Failed to handle schedule request";
    console.error("[Scheduler API] GET error:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

/**
 * POST /api/meta/schedule — Schedule a post for future publication.
 * Body: { caption: string, platforms: string[], mediaUrl?: string, scheduledAt: string, accountId?: string }
 *
 * The payload is validated with the same rules as /api/meta/publish, so
 * anything accepted here is publishable when its slot comes up.
 */
export async function POST(req) {
  try {
    const { caption, platforms, mediaUrl, scheduledAt, accountId } = await req.json().catch(() => ({}));
    const acctId = resolveAccountId(accountId);

    // Same rules /api/meta/publish enforces — a post that cannot be published
    // must not be accepted into the queue, where it would only fail later.
    const invalid = validatePublishPayload({ caption, platforms, mediaUrl });
    if (invalid) {
      return NextResponse.json({ ok: false, error: invalid }, { status: 400 });
    }

    if (!scheduledAt) {
      return NextResponse.json({ ok: false, error: "Scheduled date & time are required" }, { status: 400 });
    }

    const scheduledDate = new Date(scheduledAt);
    // Allow a 10-minute grace period for timezone differences and clock drift
    const graceCutoff = new Date(Date.now() - 10 * 60 * 1000);
    if (isNaN(scheduledDate.getTime()) || scheduledDate < graceCutoff) {
      return NextResponse.json(
        {
          ok: false,
          error: `Scheduled time must be in the future. Received: ${
            isNaN(scheduledDate.getTime()) ? scheduledAt : scheduledDate.toLocaleString()
          }`,
        },
        { status: 400 }
      );
    }

    const post = await schedulePost({
      caption,
      platforms,
      mediaUrl,
      scheduledAt,
      accountId: acctId,
    });

    return NextResponse.json({ ok: true, message: "Post scheduled successfully", post });
  } catch (error) {
    const message = error.message || "Failed to schedule post";
    console.error("[Scheduler API] POST error:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/meta/schedule — Cancel/remove a scheduled post.
 * Query: ?id=...
 */
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id") || "";
    const accountId = resolveAccountId(searchParams.get("accountId"));

    if (!id) {
      return NextResponse.json({ ok: false, error: "Scheduled post ID is required" }, { status: 400 });
    }

    await deleteScheduledPost(id, accountId);
    return NextResponse.json({ ok: true, message: "Scheduled post deleted" });
  } catch (error) {
    const message = error.message || "Failed to delete scheduled post";
    console.error("[Scheduler API] DELETE error:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
