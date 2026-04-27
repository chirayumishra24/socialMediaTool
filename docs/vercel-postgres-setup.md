# Vercel Postgres Setup

This project now includes a production-oriented Postgres foundation using `drizzle-orm` and `postgres`.

## Recommended Vercel setup

Use a Postgres provider connected through the Vercel Marketplace. Vercel's docs state that Marketplace storage integrations inject environment variables into your project automatically, and Postgres providers like Neon and Supabase are supported.

Relevant Vercel docs:
- https://vercel.com/docs/storage/vercel-postgres
- https://vercel.com/docs/marketplace-storage

## Environment variables

Set one of the following:

```env
POSTGRES_URL=postgres://...
DATABASE_URL=postgres://...
```

## Local commands

```bash
npm run db:generate
npm run db:push
npm run db:studio
```

## Current schema coverage

The schema includes:

- `users`
- `research_entries`
- `content_items`
- `workflow_comments`
- `workflow_events`

It is designed for:

- SMM/Admin role separation
- script ownership
- workflow stage transitions
- approval audit history
- scheduling and publication timestamps

## Sample users

Prototype sample users are defined in `src/lib/db/schema.js`:

- `smm@skilizee.local`
- `admin@skilizee.local`

These are still prototype identities. Real auth and shared persistence should be built on top of this schema next.
