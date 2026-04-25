import { NextResponse } from "next/server";
import { getInstagramSyncStatus, syncInstagramPost } from "@/lib/meta/instagram";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { publishedUrl = "", postId = "" } = await req.json();

    if (!String(publishedUrl).trim() && !String(postId).trim()) {
      return NextResponse.json(
        { error: "Missing publishedUrl or postId", config: getInstagramSyncStatus() },
        { status: 400 }
      );
    }

    const result = await syncInstagramPost({
      publishedUrl: String(publishedUrl).trim(),
      postId: String(postId).trim(),
    });

    return NextResponse.json({
      ok: true,
      ...result,
      config: getInstagramSyncStatus(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Instagram sync failed";
    const status = /Missing Meta configuration|Provide an Instagram post URL|requires an instagram\.com/i.test(message)
      ? 400
      : /not found/i.test(message)
        ? 404
        : 500;

    return NextResponse.json(
      {
        error: message,
        config: getInstagramSyncStatus(),
      },
      { status }
    );
  }
}
