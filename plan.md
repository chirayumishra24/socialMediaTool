# SkilizeeAI — Master Build Plan

> **Stack:** Next.js 16, Tailwind v4, Gemini 3.1 Pro, Recharts
> **Last Updated:** 2026-04-24

---

## Phase 0 — Fresh Foundation ✅

- [x] 0.1 Clear old `src/` content entirely
- [x] 0.2 New `.env.local` with proper key structure
- [x] 0.3 New `globals.css` — dark-first premium design system
- [x] 0.4 New `layout.js` — branding, fonts, meta
- [x] 0.5 New `Sidebar.jsx` — new nav structure (7 tabs)
- [x] 0.6 New `page.js` — shell with tab routing
- [x] 0.7 New `Header.jsx` — context-aware header
- [x] 0.8 New `Dashboard.jsx` — command center with stats + quick actions

---

## Phase 1 — AI Engine (`src/lib/ai/`) ✅

- [x] 1.1 `ai-client.js` — Gemini 3.1 Pro wrapper with retry, JSON mode
- [x] 1.2 `research-agent.js` — deep topic R&D agent
- [x] 1.3 `writer-agent.js` — multi-format script generation (7 formats, 7 styles)
- [x] 1.4 `editor-agent.js` — content polishing agent
- [x] 1.5 `seo-agent.js` — precision tags & SEO metadata
- [x] 1.6 `geo-intel.js` — location-aware content adaptation

---

## Phase 2 — Web Crawlers (`src/lib/crawlers/`) ✅

- [x] 2.1 `youtube.js` — YouTube API + scrape fallback
- [x] 2.2 `reddit.js` — Reddit search + hot/rising
- [x] 2.3 `twitter.js` — X/Twitter via Nitter RSS
- [x] 2.4 `instagram.js` — hashtag intelligence
- [x] 2.5 `news.js` — Google/Bing News RSS
- [x] 2.6 `trends.js` — Google Trends integration

---

## Phase 3 — R&D Pipeline (API + UI) ✅

- [x] 3.1 `POST /api/research` — start R&D pipeline
- [x] 3.2 `POST /api/generate` — generate from research
- [x] 3.3 `GET /api/discover` — quick cross-platform search
- [x] 3.4 `GET /api/tags` — precision tag generation
- [x] 3.5 `ResearchLab.jsx` — R&D UI with keyword/location/depth/platform controls
- [x] 3.6 `ApprovalBoard.jsx` — Kanban approval workflow (4 stages)

---

## Phase 4 — Content Studio ✅

- [x] 4.1 `ContentStudio.jsx` — script generation + 7 formats + 7 styles
- [x] 4.2 Precision tags panel (integrated in SEO tab)
- [x] 4.3 Edit report tab (hook/CTA/readability scores)
- [x] 4.4 Copy-to-clipboard per section

---

## Phase 5 — Analytics & Dashboard ✅

- [x] 5.1 `Dashboard.jsx` — command center with stat cards + pipeline flow
- [x] 5.2 `Analytics.jsx` — format distribution + recent activity
- [x] 5.3 `storage.js` — localStorage persistence for research/content/settings

---

## Phase 6 — Settings ✅

- [x] 6.1 `Settings.jsx` — API keys, location, language, AI model selection

---

## Phase 7 — Discover Hub ✅

- [x] 7.1 `DiscoverHub.jsx` — cross-platform search with sort/filter
- [x] 7.2 Platform filter chips + trending quick-search

---

## Phase 8 — Intelligence Enrichment ✅

- [x] 8.1 **AI Strategy Planner** — Updated `research-agent.js` to provide high-level strategy blueprints
- [x] 8.2 **Instagram Deep Integration** — Integrated Instagram into crawl pipeline & strategy UI
- [x] 8.3 **Informative Content Filtering** — Prompt enforcement for educational/high-value content
- [x] 8.4 **Vague Input Validation** — AI detection for broad keywords with suggestion system
- [x] 8.5 **Strategy Blueprint UI** — Modern card-based strategy visualization in `ResearchLab.jsx`

## Phase 9 — Agency-Grade Operations (P0) ✅

- [x] 9.1 **Brand Voice Memory (RAG)** — Settings UI to define Tone, Audience, Values, and Avoid Words
- [x] 9.2 **Voice Injection** — Integrated Brand Voice parameters into `Writer Agent` and API pipeline
- [x] 9.3 **Scheduling System** — Added date picker to `ApprovalBoard.jsx` and updated storage schemas
- [x] 9.4 **Visual Content Calendar** — New `ContentCalendar.jsx` to map scheduled posts onto a visual month grid

---

## ✅ ALL PHASES COMPLETE — Platform Live at localhost:3001
