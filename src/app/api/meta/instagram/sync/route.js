import { NextResponse } from "next/server";
import { getInstagramSyncStatus, syncInstagramPost } from "@/lib/meta/instagram";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { publishedUrl = "", postId = "" } = await req.json();

    if (!String(publishedUrl).trim() && !String(postId).trim()) {
      const config = await getInstagramSyncStatus();
      return NextResponse.json(
        { error: "Missing publishedUrl or postId", config },
        { status: 400 }
      );
    }

    const result = await syncInstagramPost({
      publishedUrl: String(publishedUrl).trim(),
      postId: String(postId).trim(),
    });

    const config = await getInstagramSyncStatus();
    return NextResponse.json({
      ok: true,
      ...result,
      config,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Instagram sync failed";
    const status = /Missing Meta configuration|Provide an Instagram post URL|requires an instagram\.com/i.test(message)
      ? 400
      : /not found/i.test(message)
        ? 404
        : 500;

    const config = await getInstagramSyncStatus().catch(() => ({ ready: false }));
    return NextResponse.json(
      {
        error: message,
        config,
      },
      { status }
    );
  }
}
