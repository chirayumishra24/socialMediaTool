import { NextResponse } from "next/server";
import { getOAuthLoginUrl } from "@/lib/meta/meta-config";
import { completeOAuthFlow, deleteTokenData, getConnectionStatus } from "@/lib/meta/meta-auth";
import { resolveAccountId } from "@/lib/accounts";

export const dynamic = "force-dynamic";

/**
 * GET /api/meta/auth — Returns the OAuth login URL for Meta.
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = resolveAccountId(searchParams.get("accountId"));
    const loginUrl = getOAuthLoginUrl("", accountId);
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
    const { code, accountId } = await req.json().catch(() => ({}));
    const acctId = resolveAccountId(accountId);

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Authorization code is required" },
        { status: 400 }
      );
    }

    const tokenData = await completeOAuthFlow(code, acctId);

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
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = resolveAccountId(searchParams.get("accountId"));
    await deleteTokenData(accountId);
    return NextResponse.json({ ok: true, message: "Meta account disconnected" });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to disconnect" },
      { status: 500 }
    );
  }
}
