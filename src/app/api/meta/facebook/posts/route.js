import { NextResponse } from "next/server";
import { fetchFacebookPagePosts } from "@/lib/meta/facebook";

export const dynamic = "force-dynamic";

/**
 * GET /api/meta/facebook/posts — Fetch recent Facebook Page posts.
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const pageId = searchParams.get("pageId") || "";
    const limit = parseInt(searchParams.get("limit") || "12", 10);

    const posts = await fetchFacebookPagePosts(pageId || undefined, limit);

    return NextResponse.json({ ok: true, posts, count: posts.length });
  } catch (error) {
    const message = error.message || "Failed to fetch Facebook posts";
    console.error("[Facebook Posts API]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
