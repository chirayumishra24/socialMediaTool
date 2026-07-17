import { NextResponse } from "next/server";
import { getOAuthLoginUrl } from "@/lib/meta/meta-config";
import { completeOAuthFlow, deleteTokenData, getConnectionStatus } from "@/lib/meta/meta-auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/meta/auth — Returns the OAuth login URL for Meta.
 */
export async function GET() {
  try {
    const loginUrl = getOAuthLoginUrl();
    return NextResponse.json({ ok: true, loginUrl });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to generate OAuth URL" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/meta/auth — Exchanges authorization code for access token.
 * Body: { code: string }
 */
export async function POST(req) {
  try {
    const { code } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Authorization code is required" },
        { status: 400 }
      );
    }

    const tokenData = await completeOAuthFlow(code);

    return NextResponse.json({
      ok: true,
      connected: true,
      facebook: tokenData.fbPageName
        ? { pageId: tokenData.fbPageId, pageName: tokenData.fbPageName }
        : null,
      instagram: tokenData.igUsername
        ? { accountId: tokenData.igAccountId, username: tokenData.igUsername }
        : null,
      expiresAt: tokenData.expiresAt,
    });
  } catch (error) {
    const message = error.message || "OAuth flow failed";
    console.error("[Meta Auth API] POST error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/meta/auth — Disconnects Meta account (removes stored tokens).
 */
export async function DELETE() {
  try {
    await deleteTokenData();
    return NextResponse.json({ ok: true, message: "Meta account disconnected" });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to disconnect" },
      { status: 500 }
    );
  }
}
