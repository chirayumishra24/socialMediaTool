import { NextResponse } from "next/server";
import { getRedditTrends } from "@/lib/reddit";

export async function GET() {
  try {
    const trends = await getRedditTrends();
    return NextResponse.json({ trends });
  } catch (error) {
    console.error("Reddit API Error:", error);
    return NextResponse.json({ error: "Failed to fetch Reddit trends" }, { status: 500 });
  }
}
