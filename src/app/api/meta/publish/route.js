import { NextResponse } from "next/server";
import { publishToMultiplePlatforms, validatePublishPayload } from "@/lib/meta/publisher";
import { resolveAccountId } from "@/lib/accounts";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // IG publishing status polling can take some time

/**
 * POST /api/meta/publish — Publish content immediately to Instagram and/or Facebook Page.
 * Body: { caption: string, platforms: string[], mediaUrl?: string }
 */
export async function POST(req) {
  try {
    const { caption, platforms, mediaUrl, accountId } = await req.json().catch(() => ({}));
    const acctId = resolveAccountId(accountId);

    const invalid = validatePublishPayload({ caption, platforms, mediaUrl });
    if (invalid) {
      return NextResponse.json({ ok: false, error: invalid }, { status: 400 });
    }

    const response = await publishToMultiplePlatforms({
      caption,
      platforms,
      mediaUrl,
      accountId: acctId,
    });

    if (response.errors?.length === platforms.length) {
      return NextResponse.json(
        {
          ok: false,
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
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
