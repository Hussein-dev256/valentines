# Valentines

A playful Valentine web app built with React, TypeScript, Vite, and Supabase. A sender creates a Valentine, shares a private receiver link, and gets a separate private results link to check whether the answer was `yes`, `no`, or still `pending`.

## What This App Does

- Creates personalized Valentine prompts with optional sender names
- Generates separate tokenized URLs for the receiver and the sender
- Lets the receiver answer from a dedicated link
- Lets the sender check results from a different private link
- Stores sender result links locally for the `My Valentines` page
- Tracks engagement events in Supabase
- Provides an optional admin analytics dashboard when configured

## User Flow

1. Open `/create` and enter the receiver name, plus an optional sender name.
2. The app creates a Valentine record and generates:
   - a receiver URL: `/v/:receiverToken`
   - a sender results URL: `/r/:senderToken`
3. The sender shares the receiver URL through the built-in share flow.
4. The receiver opens the link and answers `yes` or `no`.
5. The sender opens the results URL to reveal the response.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/create` | Valentine creation form |
| `/created/:id` | Post-create share screen |
| `/v/:token` | Receiver answer page |
| `/r/:token` | Sender results page |
| `/my-valentines` | Local list of stored sender result links |
| `/admin` | Analytics dashboard |

## Stack

- React 19
- TypeScript
- Vite
- React Router
- Supabase JavaScript client
- Vitest + Testing Library + fast-check
- Tailwind-based styling utilities and custom CSS

## Project Structure

```text
src/
  components/   Reusable UI pieces
  lib/          Shared infrastructure such as the Supabase client
  pages/        Route-level screens
  services/     Supabase-facing business logic
  test/         Test setup
  types/        Shared application and database types
  utils/        Local helpers for storage, confetti, and sender identity
public/         Static assets and PWA metadata
```

## Data And Access Model

This app uses a dual-token flow:

- `receiver_token` authorizes access to the answer page
- `sender_token` authorizes access to the results page

The frontend only uses the Supabase anon key. Data access is expected to be enforced by Row Level Security on the Supabase side.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file from the template:

```bash
Copy-Item .env.example .env.local
```

3. Populate `.env.local`:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ADMIN_PASSWORD=choose-a-strong-password
```

4. Start the dev server:

```bash
npm run dev
```

## Available Scripts

- `npm run dev` starts the Vite dev server
- `npm run build` creates the production bundle
- `npm run preview` previews the production bundle locally
- `npm run lint` runs ESLint
- `npm run test` runs Vitest
- `npm run test:ui` opens the Vitest UI
- `npm run test:coverage` runs tests with coverage

## Testing

The test suite includes:

- component tests for core UI behavior
- service tests for Supabase interactions
- property-based tests for token generation and answer flow behavior

Run everything with:

```bash
npm run test
```

## Deployment

`vercel.json` rewrites all routes to `index.html`, which is required for client-side routing in production deployments.

Before deploying, make sure the following are set in the hosting environment:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ADMIN_PASSWORD`

## Repository Hygiene

- `.env` files and local environment variants should stay out of Git
- only the public Supabase anon key belongs in client configuration
- never commit service-role keys, passwords, exported database dumps, or ad hoc credential notes
- build output and dependency folders should remain untracked

The repo also includes a [rhythm.md](./rhythm.md) file that captures the working standards for ongoing maintenance.
