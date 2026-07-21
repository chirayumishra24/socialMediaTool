import { NextResponse } from "next/server";
import {
  schedulePost,
  getScheduledPosts,
  deleteScheduledPost,
  checkAndPublishPending,
} from "@/lib/meta/scheduler";

export const dynamic = "force-dynamic";

/**
 * GET /api/meta/schedule — Returns the list of scheduled posts.
 * Can also be triggered as a cron ping to check and publish pending posts via ?check=true query.
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const runCheck = searchParams.get("check") === "true";

    if (runCheck) {
      console.log("[Scheduler API] Running check for pending scheduled posts...");
      const executed = await checkAndPublishPending();
      return NextResponse.json({ ok: true, executedCount: executed.length, executed });
    }

    const posts = await getScheduledPosts();
    return NextResponse.json({ ok: true, posts });
  } catch (error) {
    const message = error.message || "Failed to handle schedule request";
    console.error("[Scheduler API] GET error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/meta/schedule — Schedule a post for future publication.
 * Body: { caption: string, platforms: string[], mediaUrl?: string, scheduledAt: string }
 */
export async function POST(req) {
  try {
    const { caption, platforms, mediaUrl, scheduledAt } = await req.json();

    if (!caption || typeof caption !== "string") {
      return NextResponse.json({ error: "Caption is required" }, { status: 400 });
    }

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json({ error: "At least one platform is required" }, { status: 400 });
    }

    if (!scheduledAt) {
      return NextResponse.json({ error: "Scheduled date & time are required" }, { status: 400 });
    }

    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime()) || scheduledDate < new Date()) {
      return NextResponse.json({ error: "Scheduled time must be in the future" }, { status: 400 });
    }

    const post = await schedulePost({
      caption,
      platforms,
      mediaUrl,
      scheduledAt,
    });

    return NextResponse.json({ ok: true, message: "Post scheduled successfully", post });
  } catch (error) {
    const message = error.message || "Failed to schedule post";
    console.error("[Scheduler API] POST error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
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

    if (!id) {
      return NextResponse.json({ error: "Scheduled post ID is required" }, { status: 400 });
    }

    await deleteScheduledPost(id);
    return NextResponse.json({ ok: true, message: "Scheduled post deleted" });
  } catch (error) {
    const message = error.message || "Failed to delete scheduled post";
    console.error("[Scheduler API] DELETE error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
