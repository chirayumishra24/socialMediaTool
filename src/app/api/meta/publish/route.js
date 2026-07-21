import { NextResponse } from "next/server";
import { publishToMultiplePlatforms } from "@/lib/meta/publisher";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // IG publishing status polling can take some time

/**
 * POST /api/meta/publish — Publish content immediately to Instagram and/or Facebook Page.
 * Body: { caption: string, platforms: string[], mediaUrl?: string }
 */
export async function POST(req) {
  try {
    const { caption, platforms, mediaUrl } = await req.json();

    if (!caption || typeof caption !== "string") {
      return NextResponse.json({ error: "Caption is required" }, { status: 400 });
    }

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json({ error: "At least one platform is required" }, { status: 400 });
    }

    if (platforms.includes("instagram") && !mediaUrl) {
      return NextResponse.json({ error: "Media URL is required to publish to Instagram" }, { status: 400 });
    }

    const response = await publishToMultiplePlatforms({
      caption,
      platforms,
      mediaUrl,
    });

    if (response.errors?.length === platforms.length) {
      return NextResponse.json(
        {
          error: "All platform publishing attempts failed",
          errors: response.errors,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Publishing complete",
      ...response,
    });
  } catch (error) {
    const message = error.message || "Failed to publish content";
    console.error("[Meta Publish API]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
