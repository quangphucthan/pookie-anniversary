# pookie-anniversary

Next.js + TypeScript + Supabase. Private photo album with a live day counter.

## Setup

1. Create a Supabase project.
2. SQL Editor → paste and run [`supabase/schema.sql`](supabase/schema.sql).
3. Authentication → Sign In / Providers → **turn off "Allow new users to sign up"**.
   Then Authentication → Users → _Add user_ twice, once for each of you.
   Leave signups on and this is a public photo album with a login box.
4. `cp .env.example .env.local` and fill in both values from Project Settings → Data API.
5. `npm install && npm run dev`

## Deploy

Vercel → import the repo → add the same two env vars → done.
Keep the repo **private**.

## Commands

|                 |                                              |
| --------------- | -------------------------------------------- |
| `npm run dev`   | local                                        |
| `npm test`      | the date maths (the one bit with edge cases) |
| `npm run lint`  | eslint                                       |
| `npm run build` | production build                             |

Edit [`config.ts`](config.ts) for the title, start date, and letter.
