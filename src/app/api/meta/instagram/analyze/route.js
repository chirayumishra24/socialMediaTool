import { NextResponse } from "next/server";
import { generateStrategy } from "@/lib/ai/strategy-agent";
import { setActiveStrategy } from "@/lib/ai/strategy-context";
import { resolveAccountId } from "@/lib/accounts";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req) {
  try {
    const { profileData, profileContext, accountId: rawAccountId } = await req.json().catch(() => ({}));
    const accountId = resolveAccountId(rawAccountId);

    if (!profileData || !profileData.profile) {
      return NextResponse.json(
        { ok: false, error: "profileData with profile info is required. Scrape the profile first." },
        { status: 400 }
      );
    }

    // Refuse to build a strategy from the zeroed placeholder profile the scrape
    // route returns when Meta cannot resolve the account. Fed that, the model
    // has nothing account-specific to work from and returns generic advice that
    // reads like a canned fallback — so fail loudly instead.
    const profile = profileData.profile;
    const hasSignal =
      Number(profile.followers) > 0 ||
      Number(profile.postCount) > 0 ||
      (Array.isArray(profileData.posts) && profileData.posts.length > 0) ||
      Boolean((profile.bio || "").trim());

    if (!hasSignal) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "No account data to analyse — followers, posts and bio are all empty. " +
            "Connect this account under Settings → Meta Connect, sync via the Chrome extension, " +
            "or enter your stats manually. A strategy built on an empty profile is generic by construction.",
          needsManualInput: true,
        },
        { status: 422 }
      );
    }

    const strategy = await generateStrategy(profileData, profileContext || {}, accountId);

    // Also persist at the API layer for redundancy
    setActiveStrategy(strategy, accountId);

    return NextResponse.json({
      ok: true,
      strategy,
      dataSource: profileData.source || profileData.dataSource || "unknown",
      postsAnalysed: Array.isArray(profileData.posts) ? profileData.posts.length : 0,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Strategy generation failed";
    console.error("Instagram analyze error:", message);

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
