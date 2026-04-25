# Skilizee Edu — Master Build Plan

> **Stack:** Next.js 16, Tailwind v4, Gemini 3.1 Pro, Recharts
> **Last Updated:** 2026-04-25

---

## Phases 0–9 — COMPLETE ✅

All foundation, AI engine, crawlers, R&D pipeline, Content Studio, Analytics,
Settings, Discover Hub, Intelligence Enrichment, and Agency-Grade Operations
have been built and deployed. See git history for details.

---

## Phase 10 — Real Platform Data (Instagram, X, News)

### 10.0 Current Crawler Audit

| Crawler | Real Data? | Method | Quality |
|---|---|---|---|
| **YouTube** (`youtube.js`) | ✅ Yes | YouTube Data API v3 + HTML scrape fallback | **Excellent** — real video links, thumbnails, view counts, tags |
| **Reddit** (`reddit.js`) | ✅ Yes | Reddit public JSON API (no key needed) | **Good** — real posts, scores, comments, subreddit info |
| **News** (`news.js`) | ✅ Yes | Google News RSS + Bing News RSS | **Good** — real headlines, links, source attribution |
| **X / Twitter** (`twitter.js`) | ⚠️ Partial | Nitter RSS proxy → hardcoded fallback | **Fragile** — Nitter instances go down frequently, fallback returns fake emoji-based data |
| **Instagram** (`instagram.js`) | ❌ **FAKE** | Hardcoded format recommendations | **None** — returns 5 static format suggestions, zero real posts/reels/links |
| **Google Trends** (`trends.js`) | ✅ Yes | Google Trends RSS feed | **OK** — trending keywords only, no post-level data |

> **Bottom line:** Instagram returns zero real data. X/Twitter is unreliable.
> Both need to be fixed.

---

### 10.1 Instagram — Options Analysis

Instagram has **no free public API**. Meta's official Graph API requires
a Business Account, Facebook Page link, App Review, and OAuth. It limits
you to 30 unique hashtag queries per 7 days. This is overkill for our
use case (a school director's research tool).

#### Option A — RapidAPI Instagram Scraper (⭐ RECOMMENDED)

| | |
|---|---|
| **What** | Third-party API on RapidAPI Hub that scrapes Instagram's public data in real-time |
| **Cost** | Free tier: ~100 requests/month. Paid: $10–$30/mo for 1,000–5,000 requests |
| **Setup** | 1. Create free [RapidAPI](https://rapidapi.com) account → 2. Search "Instagram Scraper" → 3. Subscribe to free plan → 4. Copy `x-rapidapi-key` |
| **Data** | Real reels, posts, thumbnails, captions, likes, comments, hashtag search |
| **Pros** | Fast setup (5 min), no OAuth, no Facebook Page needed, real data |
| **Cons** | Free tier is limited, third-party dependency, may break if Instagram changes layout |
| **API Key needed** | `RAPIDAPI_KEY` (one key works for both Instagram AND X scrapers) |

#### Option B — Apify Instagram Scraper

| | |
|---|---|
| **What** | Dedicated web scraping platform with maintained Instagram actors |
| **Cost** | Free tier: $5/mo platform credit. Pay-per-usage after |
| **Setup** | 1. Create [Apify](https://apify.com) account → 2. Get API token → 3. Use their Instagram Hashtag Scraper actor |
| **Pros** | Very reliable, maintained infrastructure, handles proxies automatically |
| **Cons** | Slower (runs in cloud), more complex integration, usage-based pricing |
| **API Key needed** | `APIFY_API_TOKEN` |

#### Option C — Meta Instagram Graph API (Official)

| | |
|---|---|
| **What** | Meta's official API for Instagram Business/Creator accounts |
| **Cost** | Free, but requires significant setup |
| **Setup** | 1. Instagram Business Account → 2. Link to Facebook Page → 3. Create Meta Developer App → 4. App Review → 5. OAuth flow → 6. Generate long-lived token |
| **Pros** | Official, stable, well-documented |
| **Cons** | **Heavy setup** (days to weeks for app review), requires FB Page, 30 hashtag/7-day limit, overkill for research |
| **API Key needed** | `INSTAGRAM_ACCESS_TOKEN` + `INSTAGRAM_USER_ID` |

> **Recommendation:** Go with **Option A (RapidAPI)**. One `RAPIDAPI_KEY`
> gives you access to both Instagram AND X/Twitter scrapers on the same
> marketplace. Fastest time-to-value.

---

### 10.2 X / Twitter — Fix Strategy

Current state: Nitter RSS proxy with hardcoded fallback. Nitter instances
are unreliable and frequently go offline.

**X Official API:**
- Free tier: **No search at all** (write-only)
- Basic tier: $100/month for 7-day search history
- Too expensive for this use case

**Solution: RapidAPI Twitter/X Scraper**
- Same `RAPIDAPI_KEY` used for Instagram
- Search tweets, get engagement metrics, hashtags
- Free tier: ~100 requests/month
- Falls back to current Nitter → hardcoded chain if RapidAPI fails

---

### 10.3 Required API Keys — Summary

| Key | Currently Have? | Where to Get | Cost |
|---|---|---|---|
| `GEMINI_API_KEY` | ✅ Yes | [AI Studio](https://aistudio.google.com/apikey) | Free |
| `YOUTUBE_API_KEY` | ✅ Yes | [Google Cloud Console](https://console.cloud.google.com/) | Free (10K quota/day) |
| `RAPIDAPI_KEY` | ❌ **NEEDED** | [RapidAPI](https://rapidapi.com) → Sign up → Dashboard → API Key | Free to sign up |

> **One new key unlocks both Instagram AND X/Twitter real data.**

### 10.4 Updated `.env.local` Structure

```env
# SkilizeeAI — API Keys & Config
GEMINI_API_KEY=your_gemini_key
YOUTUBE_API_KEY=your_youtube_key

# NEW — RapidAPI (Instagram + X scrapers)
RAPIDAPI_KEY=your_rapidapi_key

# Defaults
DEFAULT_REGION=IN
DEFAULT_LANGUAGE=en
```

---

### 10.5 Implementation Roadmap

#### Step 1 — Settings UI Update (10 min)
- [ ] 10.5.1 Add `RAPIDAPI_KEY` field to `Settings.jsx`
- [ ] 10.5.2 Add the key to storage schema
- [ ] 10.5.3 Add `RAPIDAPI_KEY` to `.env.local`

#### Step 2 — Instagram Crawler Rewrite (30 min)
- [ ] 10.5.4 Research best RapidAPI Instagram scraper endpoint
- [ ] 10.5.5 Rewrite `instagram.js` to call RapidAPI hashtag/keyword search
- [ ] 10.5.6 Return real posts: reel links, thumbnails, captions, like/comment counts
- [ ] 10.5.7 Keep current hardcoded data as graceful fallback (no API key → format tips)
- [ ] 10.5.8 Filter for English content

#### Step 3 — X/Twitter Crawler Upgrade (20 min)
- [ ] 10.5.9 Add RapidAPI X scraper as primary data source
- [ ] 10.5.10 Keep Nitter as secondary fallback
- [ ] 10.5.11 Keep hardcoded templates as last-resort fallback
- [ ] 10.5.12 Real tweet links, engagement metrics, hashtags

#### Step 4 — Frontend Polish (15 min)
*   [x] **Phase 3.2: Knowledge Base (RAG) Refinement**
    *   [x] Create a "School Context" upload/input area in Settings.
    *   [x] Update `writer-agent.js` to prioritize this "Internal Truth" context.
*   [x] **Phase 3.3: Visual Social Previews**
    *   [x] Build `SocialPreview.jsx` with phone mockups for IG, X, and LinkedIn.
    *   [x] Integrate "Visual Mockup" tab into `ContentStudio.jsx`.
- [ ] 10.5.13 Update `ResearchLab.jsx` Instagram section to render real reel cards with thumbnails
- [ ] 10.5.14 Update `DiscoverHub.jsx` to show Instagram results with proper previews
- [ ] 10.5.15 Add "Video" badge/link for Instagram reels
- [ ] 10.5.16 Update X/Twitter section to show real tweet content

#### Step 5 — Testing & Validation (10 min)
- [ ] 10.5.17 Test with real `RAPIDAPI_KEY`
- [ ] 10.5.18 Test fallback behavior (no key → graceful degradation)
- [ ] 10.5.19 Verify English-only filtering works across all platforms
- [ ] 10.5.20 Build verification (`npm run build`)

---

### 10.6 Architecture After Phase 10

```
User searches "NEP 2020 changes"
        │
        ▼
┌─────────────────────────────────┐
│       API Route (research)       │
├─────────────────────────────────┤
│                                 │
│  YouTube ──► YT Data API v3    │  ✅ Real videos
│  Reddit  ──► Public JSON API   │  ✅ Real posts
│  News    ──► Google/Bing RSS   │  ✅ Real articles
│  Instagram ► RapidAPI Scraper  │  🆕 Real reels & posts
│  X/Twitter ► RapidAPI Scraper  │  🆕 Real tweets
│              └► Nitter fallback│
│              └► Static fallback│
│                                 │
│  All platforms ──► AI Research  │
│  Agent (Gemini) for analysis    │
└─────────────────────────────────┘
```

---

## ✅ Phases 0–9 COMPLETE | Phase 10 READY TO IMPLEMENT
