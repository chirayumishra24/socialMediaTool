import { NextResponse } from "next/server";
import { getConnectionStatus } from "@/lib/meta/meta-auth";
import { getMetaConfig } from "@/lib/meta/meta-config";

export const dynamic = "force-dynamic";

/**
 * GET /api/meta/status — Returns Meta connection status, token health, and connected accounts.
 */
export async function GET() {
  try {
    const status = await getConnectionStatus();
    const { ready } = getMetaConfig();

    return NextResponse.json({
      ok: true,
      appConfigured: ready,
      ...status,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to check Meta status" },
      { status: 500 }
    );
  }
}
