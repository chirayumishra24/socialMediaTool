---
name: social-media
description: "Operating manual for the SkilliZee Social Media Tool — a multi-account Instagram/Facebook content engine (Next.js 16, Gemini, Meta Graph v22.0). Use when working on content generation, the content calendar, the scheduler or publisher, Meta insights and analytics, account switching, or any /api/meta/* route. Also use before changing any AI agent prompt in src/lib/ai/."
argument-hint: "calendar | schedule | publish | insights | analytics | prompts | accounts | audit"
---

# Social Media Tool — Operating Manual

Next.js 16.2.3 (App Router) · React 19.2.4 · Tailwind v4 · Gemini via
`@google/genai` · Meta Graph API v22.0 · Firestore. Build with
`npm run build` (`next build --webpack`). React Compiler is **on**.

The app manages real Instagram and Facebook business accounts. Publishing is
irreversible and rate-limited. Read "Before You Touch Publishing" before
running anything that writes to Meta.

## Map

| Area | Path | Owns |
|---|---|---|
| Accounts | `src/lib/accounts.js` | `ACCOUNTS` registry, `resolveAccountId` |
| Meta auth | `src/lib/meta/meta-auth.js` | tokens, refresh, IG/FB credentials |
| Meta config | `src/lib/meta/meta-config.js` | Graph URLs, per-account env, rate limits |
| Reads | `src/lib/meta/deep-insights.js`, `instagram.js`, `facebook.js` | all Graph API reads |
| Writes | `src/lib/meta/publisher.js` | the only code that posts to Meta |
| Queue | `src/lib/meta/scheduler.js` | scheduled posts, cron sweep |
| Analytics | `src/lib/meta/analytics-store.js`, `unified-metrics.js` | snapshots, trends |
| AI agents | `src/lib/ai/*.js` | calendar, strategy, research, writer, editor, SEO |
| Shared context | `src/lib/ai/strategy-context.js`, `calendar-store.js` | strategy ↔ calendar alignment |
| Client storage | `src/lib/storage.js` | account-prefixed localStorage |
| UI | `src/components/*.jsx` | tabs routed by `activeTab` in `src/app/page.js` |

Tabs: `dashboard`, `research`, `studio`, `calendar`, `approval`, `composer`,
`discover`, `analytics`, `campaign-hub`, `instagram-analyzer`, `settings`, `admin`.

Access is role-gated (`linkedin`, `social_media`, `podcast`, `admin`) against a
user store shared with the sibling LinkedIn and Podcast tools. `AccessDenied.jsx`
links across to them via `NEXT_PUBLIC_*_URL`.

## Five Invariants

Violating any of these breaks the tool quietly — no error, just wrong data.

**1. Every Meta call carries `accountId`.**
Two live accounts share this codebase: `skillizee` (@skillizee.io, env prefix
`META_`) and `ccis` (@ccis.india, prefix `CCIS_META_`). Every lib function takes
`accountId` and **defaults it to `"skillizee"`**. Omitting the argument does not
throw — it silently queries CCIS's account ID with Skillizee's access token, and
returns an error or an empty set that the caller swallows into a `.catch()`.
Thread it through every layer: route → agent → lib → `graphRequest`.

```js
resolveAccountId(body.accountId)        // routes: normalize untrusted input first
graphRequest(path, params, accountId)   // 3rd arg is NOT optional in practice
fbGraphRequest(path, params, true, accountId)
```

Never read the active account from module state inside a prompt builder or
helper — pass it as an argument. Module-level defaults are how account bleed
gets in.

**2. Module state does not survive.** API routes run on serverless instances that
are recycled between requests. Anything held in a module-level variable is gone
by the next request. Persist through Firestore, with an in-memory fallback:
`scheduler.js`, `analytics-store.js`, `calendar-store.js`, `meta-auth.js` all
follow the same shape — copy it, don't invent a new one.

Collections: `skilizee_users`, `meta_tokens`, `scheduled_posts`,
`analytics_snapshots`, `post_performance_log`, `content_calendars`.
Firestore rejects `undefined` — strip it (`JSON.parse(JSON.stringify(x))`)
before writing.

`strategy-context.js` is deliberately in-memory: it is a same-request prompt
cache, not storage. Read the durable store first, fall back to it.

**3. One response envelope.** Every `/api/meta/*` route returns
`{ ok: true, ...payload }` or `{ ok: false, error: string }` with a real status
code. Clients must check `res.ok` and surface `data.error` through
`useToast()` — never fire-and-forget a mutation.

**4. A post that cannot be published must not be queued.**
`validatePublishPayload()` in `publisher.js` is the single source of truth, used
by both `/api/meta/publish` and `/api/meta/schedule`. Rules: caption required;
at least one platform; platform must be `instagram` or `facebook`; **Instagram
requires a public `mediaUrl`**. Instagram publishes from a URL Meta's servers
fetch — a `blob:` URL or a local file will fail. If you add a platform or a
constraint, add it there, not in a route.

**5. Tailwind v4 class names must appear literally in source.** Tailwind scans
statically; `bg-${color}-50` never generates. Per-account styling lives as
fully-written strings under `ACCOUNTS[id].ui`.

## Where the Numbers Come From

The value of this tool is that its recommendations cite real account data. That
only holds if you know which numbers are real. Before adding a figure to a
prompt or a dashboard, classify it:

| Provenance | What | Source |
|---|---|---|
| **Measured** | reach, views, profile views, website clicks, follower count | `fetchAccountInsights` (v22.0 splits time-series vs `metric_type=total_value` — the split is deliberate, don't merge it) |
| **Measured** | per-post reach, saves, shares, total interactions, plays, Reel avg/total watch time | `fetchDeepPostInsights` — metric set varies by format, with fallback to smaller sets |
| **Measured** | follower city / country / age-gender | `fetchAudienceDemographics`, `follower_demographics` breakdowns |
| **Measured** | follower-online counts **by hour** | `online_followers` (lifetime) |
| **Measured** | hashtag reach/engagement averages, caption topic clusters | `buildSnapshotFromInsights`, `extractTopicClusters` |
| **Measured** | **day-of-week** performance | `computeDayOfWeekPerformance` — buckets real post timestamps |
| **Derived** | week-over-week trends | `computeTrends` over stored snapshots; `available: false` until ≥2 exist |
| **Synthesized** | the 7×24 heatmap grid and its `bestDays` | `buildOptimalPostingHeatmap` repeats the hourly curve across all 7 days with a 0.85 weekend multiplier. **Meta never exposes per-day follower activity.** These "best days" are an artifact of that multiplier, not a measurement — never present them as data |
| **Model estimate** | `estimatedReach` on a calendar entry | the LLM, anchored to format averages |

When a source is missing, the fetchers return `{}` / `[]` / `{ available: false }`
rather than throwing. A prompt that says "cite specific numbers" will happily
invent them to fill that hole — so gaps must be labelled, not silently empty.

## Prompt Discipline

These rules apply to every agent in `src/lib/ai/`. They are why the output is
usable rather than plausible-sounding.

1. **Label provenance in the prompt.** Head each block with `MEASURED —`,
   `DERIVED —`, or `NOT MEASURED:`. Where a section is empty, write
   `UNAVAILABLE —` plus what the model should do instead. Never emit a bare
   zero: `0` reads as a measurement.
2. **Give the model an out.** Pair every "cite specific numbers" instruction
   with "never invent a metric; where a section says UNAVAILABLE, say so in the
   relevant `reasoning` field." Without the escape hatch, the demand for
   citations manufactures them.
3. **Pass context as arguments.** Prompt builders take `activeStrategy`,
   `activeCalendar`, `dayPerformance` as parameters. A builder that reaches into
   module state reads the wrong account (invariant 1).
4. **Keep cross-agent context compact.** `getStrategyDigest()` and
   `getCalendarDigest()` produce bounded summaries for injection. Do not paste a
   whole calendar into a strategy prompt.
5. **Always normalize the response.** Use `jsonMode: true`, then pass the result
   through a normalizer (`parseCalendarResponse`, `normalizeStrategy`) that
   fills every field with a typed default. The model omits keys; the UI must
   never see `undefined`. `ai-client.js` already recovers JSON from markdown
   fences, so don't add your own unwrapping.
6. **Pick the tier deliberately.** `tier: "pro"` (`gemini-3.1-pro-preview`) for
   strategy, calendars, and research; `"flash"` (`gemini-3-flash-preview`) for
   short classification and rewriting. Both retry twice with linear backoff.

## Performance Rules

The Meta read path is latency-dominated, and its cost is measured in *round
trips*, not CPU. Three rules keep a calendar run in seconds rather than minutes.

**Never read a token inside a loop.** `graphRequest()` calls
`getInstagramSyncConfig()`, which calls `getValidAccessToken()` **and**
`getInstagramAccountId()` — both of which read the same `meta_tokens` document.
Uncached, that was two full Firestore round-trips per Graph call and 136-336 per
calendar run. `getTokenData()` is now read-through cached for 60s and
invalidated by `saveTokenData`/`deleteTokenData`; if you add another token
consumer, go through `getTokenData()` so it benefits, and call
`invalidateTokenCache(accountId)` after any write to the document.

**Fan out, with a bound.** Independent Graph calls run together —
`TOTAL_VALUE_METRIC_CONFIGS` via `Promise.all`, per-post insights via
`mapWithConcurrency(posts, POST_INSIGHT_CONCURRENCY, …)`. Keep the bound small
(6): Instagram allows 200 calls/hour and an unbounded `Promise.all` over 50
posts will trip the limiter, which fails *silently* into an empty data set.

**Count your calls against the quota.** One calendar run costs roughly
`13 + 4 + 1 + postsLimit` Graph calls — about 68 with the default
`postsLimit: 50`, against a 200/hour ceiling. That is three runs per hour, per
account. `fetchDeepPostInsights` remembers which metric set worked per format
(`workingMetricSet`) so the fallback ladder is climbed once rather than once per
post; without that the worst case was 168 calls and a single run could exhaust
most of the hour. Before adding a per-post request, ask what it does to that
budget.

## Why Output Looks Generic

"The strategy feels like a fallback" is almost always the model being handed an
empty account, not the model underperforming. Every fetcher degrades quietly —
`{}`, `[]`, `{ available: false }` — so the prompt still renders, with zeros.

Trace it in this order:

1. **Was the account resolvable?** `/api/meta/instagram/scrape` returns a fully
   zeroed profile with `needsManualInput: true`, `dataSource: "none"` and a
   `reason`. `fetchInstagramProfileFromMeta` throws when the requested username
   is not the *connected* one, which is the most common trigger.
2. **Did the guard fire?** `/api/meta/instagram/analyze` returns **422** when
   followers, posts and bio are all empty. A strategy built on that is generic
   by construction, so it refuses rather than producing one.
3. **Was the calendar degraded?** `_meta.dataQuality` and `_meta.degraded`
   carry the per-source reason. The UI warns when `degraded` is non-empty.
4. **Was it the rate limiter?** "rate limit exceeded" in `dataQuality.posts`
   means the hourly budget is gone and the run silently had no post data.
   Counters are per-instance and in-memory, so they reset on restart.

Recovery path when Meta cannot resolve the account: post
`{ manual: { username, followers, postCount, bio, recentPosts: [...] } }` to
`/api/meta/instagram/scrape`, which builds a real profile via
`buildManualProfile`. The Chrome extension in `extension/` posts the same shape.

**When you add a data source, make its failure legible.** A `.catch()` that
returns an empty value without recording why is how a generic strategy gets
presented as a data-driven one.

## Format Playbook

What the platform actually supports, and what each format is optimized for.

| Format | Detected as | Metrics that matter | Publishable |
|---|---|---|---|
| **Reel** | `media_product_type = REELS` | reach, saves, shares, plays, avg watch time, total watch time | yes (needs media URL) |
| **Carousel** | `media_type = CAROUSEL_ALBUM` | saves, reach, total interactions | yes (needs media URL) |
| **Static** | everything else | saves, reach, total interactions | yes (needs media URL) |
| **Story** | — | — | **no** |

**Story is a gap, not a feature.** The calendar agent can emit `"Story"` entries
and the calendar UI has an icon for them, but `publisher.js` has no Story path
and the insights pipeline never labels a post `Story`. A Story entry can be
planned and never scheduled, published, or measured. Treat it as a planning-only
annotation until a Story publish path exists.

Optimization targets, from `writer-agent.js`:

- **Reel** — stop rate then completion. Visual pattern-interrupt in the first
  second, text overlays for retention, a save-worthy takeaway. 30–90s.
- **Carousel** — swipe-through then saves. Slide 1 is a bold hook, max 25 words
  per slide, every slide owes the reader a reason to swipe. 8–12 slides.
- **Static** — saves. One idea, one image concept, one message.
- **Caption** — `extractHashtags` reads `#\w+`; hashtag performance is tracked
  per tag, so reuse tags that measure well rather than maximizing tag count.

## Common Tasks

**Add a `/api/meta/*` route.** `export const dynamic = "force-dynamic"` (still
valid — Cache Components is not enabled in `next.config.mjs`). Add
`maxDuration` if it calls Gemini or polls IG publishing. `resolveAccountId` the
account first. Return the invariant-3 envelope.

**Change what the calendar generates.** Prompt and normalizer both live in
`calendar-agent.js` — a new field needs adding in `buildCalendarPrompt`'s JSON
schema *and* in `parseCalendarResponse`, or it is silently dropped. If the UI
should edit it, add it to the edit modal in `ContentCalendar.jsx`.

**Add a platform.** `SUPPORTED_PLATFORMS` + `validatePublishPayload` in
`publisher.js`, a publish function, a branch in `publishToMultiplePlatforms`,
and a branch in `executeScheduledPost` (scheduler has its own switch — keep the
two in step).

**Add a per-account setting.** `ACCOUNTS` in `accounts.js`, with literal
Tailwind strings under `ui`, an env prefix under `metaEnvPrefix`, and a
`storagePrefix` for localStorage isolation.

**Debug empty analytics.** In order: is `getMetaConfig(accountId).ready` true;
is the token valid (`getValidAccessToken` throws with code 190 on expiry —
`graphRequest` flags it as `metaTokenExpired`); has the rate limit tripped
(IG 200/hr, FB 4800/day, counted **in memory per instance**, so the count resets
on restart and undercounts across instances); is `accountId` actually reaching
`graphRequest`.

## Before You Touch Publishing

- `/api/meta/publish` posts **immediately** to a live account. There is no dry-run.
- `POST /api/meta/schedule` writes to the shared `scheduled_posts` collection.
- `GET /api/meta/schedule?check=true` publishes everything already due, **across
  all accounts** (`getScheduledPosts(null)`). Never call it to "test the endpoint".
- No `vercel.json` cron exists in this repo, so nothing calls `?check=true` on a
  schedule. Queued posts wait until something external pings it.
- Safe to exercise freely: every `GET`, and any `POST` you expect to be rejected
  by `validatePublishPayload`.

## Verification

1. `npm run build` — the React Compiler and Next 16 catch most mistakes here.
2. Probe the routes over HTTP: identical payloads must get identical answers
   from `/publish` and `/schedule`, and every response must carry `ok`.
3. Switch accounts in the UI and confirm the network calls carry the right
   `accountId` — this is the failure that looks like success.
4. Check the server log for `[Calendar Agent] [ccis]`-style prefixes; a missing
   account tag usually means a dropped argument.
