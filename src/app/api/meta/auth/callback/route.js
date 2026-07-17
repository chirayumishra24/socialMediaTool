import { NextResponse } from "next/server";
import { completeOAuthFlow } from "@/lib/meta/meta-auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/meta/auth/callback — OAuth redirect callback from Meta.
 * Meta redirects here with ?code=...&state=...
 */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const errorReason = searchParams.get("error_reason");

  // Determine the dashboard URL to redirect back to
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // User denied permission
  if (error) {
    const msg = encodeURIComponent(errorDescription || errorReason || "Permission denied");
    return NextResponse.redirect(`${baseUrl}?meta_auth=error&message=${msg}`);
  }

  if (!code) {
    return NextResponse.redirect(
      `${baseUrl}?meta_auth=error&message=${encodeURIComponent("No authorization code received")}`
    );
  }

  try {
    const tokenData = await completeOAuthFlow(code);

    const igUser = tokenData.igUsername ? `&ig_user=${encodeURIComponent(tokenData.igUsername)}` : "";
    const fbPage = tokenData.fbPageName ? `&fb_page=${encodeURIComponent(tokenData.fbPageName)}` : "";

    return NextResponse.redirect(
      `${baseUrl}?meta_auth=success${igUser}${fbPage}`
    );
  } catch (err) {
    console.error("[Meta Auth Callback] Error:", err.message);
    return NextResponse.redirect(
      `${baseUrl}?meta_auth=error&message=${encodeURIComponent(err.message)}`
    );
  }
}
