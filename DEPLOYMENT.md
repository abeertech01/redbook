# Deployment

How to get Redbook onto the public internet and keep it there. Unlike the per-feature `*_PLAN.md` files, this one stays — it's a reference to come back to whenever the app is redeployed or moved.

## The constraint that decides everything

Chat and notifications run over **Socket.IO**, which needs a persistent WebSocket connection. That rules out serverless hosting for the server (Vercel/Netlify functions, Cloudflare Workers) — those can't hold a connection open, and Workers isn't Node at all, so Express + Socket.IO doesn't run there regardless. **The server needs an always-on Node process.**

Two consequences worth internalising:

- **Run exactly one server instance.** `userSocketIDs` in `server/src/index.ts` is an in-memory `Map` of userId → socketId. With two instances, user A's socket lives on instance 1 while the lookup happens on instance 2, and realtime delivery silently half-breaks. Never enable autoscaling.
- **The client host doesn't need WebSocket support.** It only serves static files. The socket is opened by the *visitor's browser* directly to the API domain, so any static host works.

## Recommended stack (all free, no credit card)

| Piece | Host | Why |
|---|---|---|
| Client (`client/`) | Cloudflare Workers (static assets) | Static files. Free tier doesn't sleep or expire. |
| Server (`server/`) | Render (free web service) | Always-on Node process, supports WebSockets, no card required. |
| Database | Neon | Free Postgres that persists and auto-resumes in well under a second. |

Alternatives considered: **Fly.io** is technically the better server host (real VM, ~1s wake vs Render's ~50s cold start) but requires a card on file. Avoid free Postgres tiers that delete the database after ~30 days or pause after ~7 days idle — that's what kills long-lived demos.

> Free-tier terms change frequently. Verify current limits on each provider's pricing page before committing.

### About Render's free tier sleep

The free service **spins down after ~15 minutes with no incoming traffic** (from anyone, not just you). It is not a usage quota:

- Traffic resets the timer, so it never sleeps mid-session.
- Only the first visitor after a quiet period pays the cold start (~50s). Everyone after, while warm, gets normal speed.
- When it sleeps, open WebSocket connections drop. Socket.IO reconnects automatically once it's back, so it self-heals, but a chat left open across a sleep will have a gap.

This matters most for the "someone clicks your link cold" moment. If that's unacceptable, the paid tier removes sleep.

## No Docker needed

`server.dockerfile` and `client.dockerfile` both run dev servers (`nodemon` / `vite dev`) and are **for local `docker compose` only** — they should never face the internet. Render builds from source using the commands below, so the deploy path ignores them entirely. Nothing about `docker-compose.yaml` needs to change.

## Deploying from this monorepo

`client/` and `server/` live in one repo. Both platforms support pointing a service at a **subdirectory**, so no repo split is needed — you create two services from the same GitHub repo with different root directories.

Decide which branch to deploy from first. Work happens on `dev`; production should track `main`, so there's somewhere to push work-in-progress without triggering a live deploy.

### Order matters

Each side needs the other's URL, so there's a chicken-and-egg:

1. Deploy the **server** → get its URL
2. Deploy the **client**, pointing at that URL → get its URL
3. **Go back to the server** and set `CLIENT_URL` → redeploy

Step 3 is the easy one to forget. Skipping it means CORS rejects every request and the app looks completely broken with only console errors to explain it.

### 1. Database (Neon)

Create a project, copy the connection string. That's `DATABASE_URL`.

### 2. Server (Render)

New **Web Service** → connect the repo:

| Setting | Value |
|---|---|
| Root Directory | `server` |
| Runtime | Node |
| Build Command | `npm install && npx prisma generate && npx prisma migrate deploy && npm run build` |
| Start Command | `npm run start` |
| Instances | 1 (never more — see the constraint above) |

Environment variables:

```
DATABASE_URL              from Neon
JWT_SECRET                a long random string
CLIENT_URL                set in step 4
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

Notes specific to this repo:

- **Don't set `PORT`.** Render injects it and `src/index.ts` already reads `process.env.PORT || 3000`.
- `prisma.config.ts` reads `env("DATABASE_URL")`, so the Prisma CLI picks it up with no changes.
- `prisma migrate deploy` is idempotent — safe on every deploy. It replaces what the `migration` service does in `docker-compose.yaml`.
- `.nvmrc` (Node 24) is picked up automatically once the root directory is `server`.

### 3. Client (Cloudflare Workers, git-integrated)

Cloudflare now has two different products that both call themselves "deploy a static site": classic **Pages** (dashboard-configured Build output directory, `_redirects` file) and the newer **Workers** git-integration flow, which is config-file-driven via `client/wrangler.jsonc` and deploys with `npx wrangler deploy` instead of a dashboard output-directory field. This repo uses the latter — that's what `client/wrangler.jsonc` is for.

New Worker project → connect the repo:

| Setting | Value |
|---|---|
| Path (under "Advanced settings") | `client` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |

Environment variable:

```
VITE_SERVER_URL           the Render URL from step 2
```

**`VITE_*` variables are baked in at build time**, not read at runtime. Changing `VITE_SERVER_URL` later requires a rebuild, not just a restart.

#### Required: SPA fallback

The app uses `BrowserRouter` with client-side routes (`/post/:id`, `/messages/:chatId`, `/profile`). There is no real file at `/post/abc123`, so without a rewrite the host returns **404** whenever someone refreshes on one of those routes, opens a post link in a new tab, or follows a shared link. In-app navigation works fine, which makes this easy to miss in testing and then break for real visitors — and notification rows point at exactly these routes.

`client/wrangler.jsonc` already handles this via `assets.not_found_handling: "single-page-application"` — any request with no matching static file falls back to `index.html` with a 200. **Do not also add a `client/public/_redirects` catch-all** (`/*  /index.html  200`) alongside it — Cloudflare's build rejects that combination outright as an infinite loop (error `100324`, "Invalid _redirects configuration"), since the assets layer's own `index.html`/`.html`-stripping behavior loops back into the `_redirects` rule. The two mechanisms are redundant; `not_found_handling` alone is sufficient for this deploy path.

`_redirects` is still the right tool if this project ever moves to **classic** Cloudflare Pages (dashboard Build output directory, no `wrangler.jsonc` involved) instead — the two flows shouldn't be mixed. On Vercel, the equivalent is `client/vercel.json`:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

### 4. Close the loop

Back on Render, set `CLIENT_URL` to the exact client origin and redeploy. `corsOptions` in `server/src/constants/config.ts` uses `origin: process.env.CLIENT_URL`, so it must match **exactly** — including scheme, and **no trailing slash**.

## Auth cookies across two domains

`server/src/utils/features.ts` sets the JWT cookie with `httpOnly: true`, `secure: true`, `sameSite: "none"`. That's correct for a cross-origin setup and requires HTTPS (every host above provides it).

The catch: with the client on `*.workers.dev` and the API on `*.onrender.com`, those are unrelated sites, so the auth cookie is a **third-party cookie**. Safari blocks those by default and Chrome has been restricting them — meaning **login can silently fail for some visitors** while working fine for you.

The fix, if it bites: buy a domain (~$10/yr), put the client on `example.com` and the API on `api.example.com`. They're then same-site, and the cookie can be relaxed to `sameSite: "lax"`, sidestepping third-party cookie blocking entirely. Cloudflare's proxy passes WebSockets through fine, so `api.` can point at Render without breaking Socket.IO.

## Verify after deploying

Not just "the page loads" — check the things that break silently:

1. Register a new account (proves DB + migrations + JWT cookie).
2. Reload the page while logged in (proves the cookie actually persisted — the cross-site failure shows up here).
3. Create a post, comment, upvote.
4. Open a post URL **directly in a new tab** (proves the SPA fallback).
5. Open two different browsers, log in as two users, and send a chat message — it should arrive without a refresh (proves the WebSocket).
6. Check the bell badge updates in realtime.

If 5 fails but everything else works, the socket isn't connecting — check `CLIENT_URL` and that only one instance is running.

## Known behaviour, not bugs

- `generateFakeUsers(100)` and `generateFakePosts()` run on every server boot, in every environment including production. This is deliberate: it's a portfolio app where a populated demo matters. Both guard against re-seeding an already-populated database.
- The first request after a quiet period is slow on Render's free tier. See the sleep section above.
