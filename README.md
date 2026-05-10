<<<<<<< HEAD
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
=======
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
>>>>>>> 315785f (init files)
