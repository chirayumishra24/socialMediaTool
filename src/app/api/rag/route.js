import { NextResponse } from "next/server";
import { search, addDocument, getStoreSize, seedKnowledgeBase } from "@/lib/rag";

export async function GET(request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({
      storeSize: getStoreSize(),
      message: "Use ?q=your+query to search the knowledge base",
    });
  }

  try {
    // Seed on first use
    await seedKnowledgeBase(apiKey);
    
    const results = await search(apiKey, query, 3);
    return NextResponse.json({ results, storeSize: getStoreSize() });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { text, metadata } = body;

    if (!text) {
      return NextResponse.json({ error: "Missing 'text' field" }, { status: 400 });
    }

    const docId = await addDocument(apiKey, text, metadata || {});
    return NextResponse.json({ id: docId, storeSize: getStoreSize() });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
