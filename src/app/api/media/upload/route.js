import { NextResponse } from "next/server";
import { uploadPublicMedia } from "@/lib/meta/media-upload";
import { resolveAccountId } from "@/lib/accounts";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/media/upload — Host a local file at a public URL.
 *
 * Body: multipart/form-data with `file`, optional `accountId`.
 * Returns: { ok: true, url } — the address to hand to /api/meta/publish.
 *
 * Instagram downloads media from a URL rather than accepting an upload, so a
 * file chosen in the browser must be hosted before it can be published.
 */
export async function POST(req) {
  try {
    const form = await req.formData().catch(() => null);
    if (!form) {
      return NextResponse.json(
        { ok: false, error: "Expected multipart/form-data with a `file` field." },
        { status: 400 }
      );
    }

    const file = form.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });
    }

    const accountId = resolveAccountId(form.get("accountId"));
    const result = await uploadPublicMedia(file, accountId);

    console.log(`[Media Upload] [${accountId}] Hosted ${result.path} (${result.size} bytes)`);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error.message || "Upload failed";
    console.error("[Media Upload]", message);

    // Configuration and validation problems are the caller's to fix.
    const status = /not configured|Unsupported file type|limit is|No file/i.test(message) ? 400 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
