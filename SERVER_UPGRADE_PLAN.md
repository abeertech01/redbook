# Server Upgrade Plan

Scope: `server/` only (this branch, `feat/server-upgrade`, is server-side exclusively — no client changes). Goal: bring every server dependency, the Node runtime, and the Docker images to a current, stable, 2026-appropriate baseline — `express` 4 → 5, `prisma`/`@prisma/client` 5 → 7, `zod` 3 → 4, `typescript` 5 → latest viable, plus every other outdated package — all **without losing any existing feature or behavior**, mirroring how [CLIENT_UPGRADE_PLAN.md](CLIENT_UPGRADE_PLAN.md) was run.

Work through phases in order; check items off as completed. Each phase = one commit, so a regression can be bisected/reverted without dragging unrelated changes with it. We will not pre-write exact code diffs here — each phase gets scoped and implemented when we get to it, sequentially.

## Baseline audit (already done, informing this plan)

**Current versions** (`server/`, via `npm ls --depth=0` on 2026-08-29):
`express@4.21.1`, `@prisma/client@5.22.0` + `prisma@5.22.0`, `zod@3.23.8`, `typescript@5.6.3`, `ts-node@10.9.2`, `socket.io@4.8.1`, `bcrypt@5.1.1`, `jsonwebtoken@9.0.2`, `cloudinary@2.5.1`, `cors@2.8.5`, `dotenv@16.4.5`, `formidable@3.5.2`, `cookie-parser@1.4.7`, `@faker-js/faker@9.2.0`, plus matching `@types/*`. `tsconfig.json` targets `es2016`/`commonjs`. Both `server.dockerfile` and `migration.dockerfile` pin `FROM node:20` — locally installed Node is `v22.18.0`, so dev and container already diverge, and **Node 20 is past its EOL window as of this plan's date**, making a base-image bump a real (not cosmetic) fix, not just a version bump.

**Real breaking-change majors waiting** (confirmed via `npm outdated` + `npm view <pkg> dist-tags`):
- `express` 4 → 5 (dist-tags: `latest` is `5.2.1`, `4.x` line frozen at `latest-4: 4.22.2`) — genuine breaking changes (error-forwarding for async handlers built into core now, some route-pattern/query-parsing defaults changed). Routes in `post.routes.ts`/`chat.routes.ts`/`user.routes.ts` only use plain `:param` segments (no `?`-optional or `*`-wildcard patterns), which is the pattern most likely to break under Express 5's new `path-to-regexp` — a good sign, but needs confirming per-route in Phase 3, not assumed clean.
- `prisma`/`@prisma/client` — **tag mismatch worth deciding deliberately, not blindly bumping to whatever `npm outdated` calls "Latest."** `@prisma/client`'s `latest` dist-tag is `7.10.0`, but the `prisma` CLI package's `latest` dist-tag currently points at `8.0.0-rc.12` (a release candidate) with `7.10.0` only reachable via its `prev` tag. Pulling in a same-named "latest" for both would silently land one of them on an RC. Plan is to target the two in lockstep at `7.10.0` (the real stable line) unless we deliberately decide otherwise when we get to that phase. Separately, Prisma 7 removed `datasource { url }` from `schema.prisma` in favor of `prisma.config.ts` + passing a driver `adapter` (or `accelerateUrl`) to the `PrismaClient` constructor — this is a required migration step, not optional, and touches `server/src/lib/prismadb.ts` and how `DATABASE_URL` is read.
- `zod` 3 → 4 (`latest: 4.5.2`) — same migration shape we already did on the client (`.min`/`.max`/`.email`/`.regex` with `{ message: ... }` still supported, deprecated in favor of `{ error: ... }`), applied here to `server/src/lib/zod/*.ts` instead.
- `typescript` 5 → 7 (`latest: 7.0.2`) — unlike the client, **`server/` has no ESLint setup at all**, so the `typescript-eslint` incompatibility that forced the client to stop at TS 6.0.3 doesn't apply here. The real constraint instead is `ts-node@10.9.2`, which runs `npm run dev` via `nodemon` — its TS 7 compatibility (TS 7 is the Go-based compiler rewrite, a much bigger jump than a normal major) needs verifying before committing to latest; may also be a good point to evaluate `tsx` as a `ts-node` replacement, decided in that phase, not pre-decided here.
- `bcrypt` 5 → 6 — native-binding package; needs a clean `npm install`/rebuild check inside the `node:20`-or-whatever-we-land-on Docker image, not just locally.
- `dotenv` 16 → 17, `@faker-js/faker` 9 → 10 — majors, but both low-risk (env loading and fake-data-seeding respectively); confirm no API surface we use actually changed.

**Client-compatibility constraint (user directive):** any dependency that exists on both sides must land on a version compatible with what the client already runs — server's choice is not independent. Checked by diffing `client/package.json` against `server/package.json`:
- `zod` — client is on `^4.4.3` (post client-upgrade). Server must land on that same `4.4.x` line in Phase 5, not independently chase whatever `npm outdated` calls latest (`4.5.2`) — align first, then only move both together in a future pass if ever needed.
- `typescript` — client is pinned to `6.0.3` specifically *because* `typescript-eslint` hard-crashes on TS 7 (a client-only constraint — `server/` has no ESLint). Even though server has no technical blocker, this directive means Phase 6 targets `6.0.3` to match the client rather than independently pushing to `7.0.2` — keeps one TypeScript language version across the whole repo.
- `@types/node` — **correction, decided 2026-08-29:** this one doesn't actually belong under the client-compatibility rule. `@types/node` is compile-time-only (pure type declarations, no runtime code), and its real job is to accurately describe the Node version the code actually runs on — not to mirror a sibling package for tidiness. Since Docker fully isolates the server's runtime from both the host machine and the client (separate `node_modules` volumes, separate base image), there's no technical reason server and client need the same Node line. Server's `@types/node` tracks whatever Node major the server's Docker images actually run (see Phase 1's decision below), independent of the client's `^22.20.1`.
- `socket.io` (server) ↔ `socket.io-client` (client) — different package names, but the same protocol pairing, so the same rule applies in spirit: client already runs `socket.io-client@^4.8.3`, so server's Phase 7 bump targets `socket.io@4.8.3` to match exactly rather than drifting apart, even though both are currently `4.x` and would technically interoperate across patch versions.

**Bugs found while auditing** (pre-existing, not caused by any upgrade — confirmed fixes, scheduled into their own phase below rather than fixed now):
- `server/src/middlewares/error.ts`'s `errorMiddleware` is declared as `(err, req, res) => {...}` — **three** parameters. Express identifies error-handling middleware purely by function arity (`fn.length === 4`); confirmed via a direct Node check that this function's arity is `3`. That means Express does **not** register this as an error handler at all — it's silently dead code, and every thrown/`next(err)`-forwarded error today falls through to Express's own default HTML error page instead of this app's intended JSON `{ success: false, message, error }` shape. Worth confirming against actual client-visible error toasts before fixing.
- `server/src/middlewares/auth.ts`'s `socketAuthenticator` calls `prisma?.user.findUnique(...)` but never imports `prisma` in that file — it relies on the ambient `global.prisma` that `lib/prismadb.ts` only assigns when `NODE_ENV !== "production"`. In an actual production boot, `prisma` is `undefined` there, `prisma?.user` short-circuits to `undefined`, and `.findUnique` on `undefined` throws — meaning **every Socket.IO connection attempt would currently crash in production**, breaking realtime chat entirely outside of dev. High-priority fix candidate.
- Uncommitted local change on this branch (not something I made): `server/src/classes/chat.class.ts` currently has debug `console.log`/`console.error` statements added around the `NEW_MESSAGE` handler, plus some Prettier-style trailing-comma reformatting. Left as-is for now — flag when we get there so it doesn't get bundled silently into an unrelated commit.
- `chat.class.ts`'s socket event handlers (`newChat`, `newMessage`) catch errors and `return new ErrorHandler(...)` — this constructs an error object and immediately discards it (no `throw`, no `socket.emit` of the failure) — effectively a silent swallow. Same bucket as the two bugs above: real, pre-existing, not something this plan is scoped to introduce, but worth a deliberate fix pass since we're already touching this file for other reasons.

## Phase 0 — Setup

- [x] Confirm current app still runs as-is (baseline behavior established across the whole `feat/client-upgrade` regression pass already merged into `dev`; server side untouched since)
- [x] Create a dedicated branch for this work (`feat/server-upgrade`, off `dev`)
- [x] Record current versions as a rollback reference (`npm ls --depth=0` snapshot captured above)

## Phase 1 — Node runtime & Docker base image

**Decided (2026-08-29):** target **Node 24** (current Active LTS, EOL April 2028) for both `server.dockerfile` and `migration.dockerfile`, replacing `FROM node:20` (EOL'd April 30, 2026 — confirmed against nodejs.org's official EOL schedule). Node 22 (Maintenance LTS, EOL April 2027, and what the host machine/client both currently run) was the more conservative option, but 24 was chosen deliberately for more runway. Docker fully isolates the container runtime from the host and from the client, so this doesn't need to match either of those.

- [x] Bump `server.dockerfile` and `migration.dockerfile` from `FROM node:20` to `FROM node:24`
- [x] Bump `@types/node` to the `24.x` line (currently `22.9.0`) — tracks the actual runtime, not the client's `@types/node` (see corrected reasoning in the baseline audit above)
- [x] Add a `server/.nvmrc` containing `24`, so local `nvm use` (from `server/`) picks the matching version automatically for anyone running `npm run dev`/Prisma CLI commands directly on the host instead of through Docker
- [x] On the local machine: install Node 24 via `nvm install 24` (already using nvm, so this is fully isolated from the existing `v22.18.0` default — confirmed no risk to other projects/tools)
- [x] Rebuild the `server`/`migration` images clean (`docker compose build --no-cache server migration`) and confirm `npx prisma generate`, `npm install`, and `bcrypt`'s native binding still succeed inside the new base image
- [x] Confirm `docker compose up` still boots server → migration → server → client cleanly end to end — verified `db` (healthy) → `migration` (exited 0) → `server` (up, `node -v` inside the container reports `v24.20.0`, `GET /` returns `HTTP 200`) → `client` (up, Vite serving on 5173)

## Phase 2 — Full dependency audit confirmation

- [x] Re-run `npm outdated` at implementation time (2026-08-30) — barely moved since the Aug 29 snapshot: only `zod`'s "Latest" ticked from `4.5.2` to `4.5.4` (irrelevant anyway, we're pinning to the client's `4.4.x`); `@types/node` now correctly shows `24.13.3` current, confirming Phase 1's bump. Everything else identical.
- [x] Confirm the three buckets: (a) safe patch/minor — `@types/cookie-parser`, `@types/cors`, `@types/express` patch, `@types/formidable`, `@types/jsonwebtoken`, `cloudinary`, `cors`, `formidable`, `jsonwebtoken`, `socket.io`; (b) majors needing peer/API-surface verification only — `bcrypt`, `dotenv`, `@faker-js/faker`; (c) majors with real migration work — `express` 4→5, `prisma`/`@prisma/client` 5→7, `zod` 3→4, `typescript` 5→6 (matching client). Unchanged from the baseline audit.
- [x] Lock the `prisma`/`@prisma/client` version decision — re-checked `npm view prisma dist-tags` and `npm view @prisma/client dist-tags` on 2026-08-30: `prisma` CLI's `latest` tag is still `8.0.0-rc.12` (an RC), `@prisma/client`'s `latest` is `7.10.0`. **Locked: both `prisma` and `@prisma/client` target `7.10.0`** via `prisma`'s `prev` tag, not `latest` — avoids landing on the v8 release candidate.

## Phase 3 — Express 4 → 5 ✅ complete (2026-08-30)

- [x] Bump `express`, `@types/express` — landed on `express@^5.2.1`, `@types/express@^5.0.6` (the `@types/express` package was already pinned to the `5.x` line even while `express` itself was still `4.21.1` — a pre-existing mismatch this bump resolves)
- [x] Audit every route file (`user.routes.ts`, `post.routes.ts`, `chat.routes.ts`) against Express 5's routing changes — confirmed via grep: no `?`-optional or `*`-wildcard route patterns, no deprecated Express 4 APIs (`res.send(status, body)`, `req.param()`, `app.del`), and every `req.query` usage is a flat string value (no nested/array query syntax that Express 5's default parser change would affect)
- [x] Review the `TryCatch` wrapper against Express 5's native async-rejection forwarding — decided to leave `TryCatch` as-is: it already explicitly calls `next(error)`, so it's correct either way, just slightly redundant now. Not simplifying it now (out of scope, avoids an unnecessary refactor mixed into a dependency-bump commit)
- [x] `npm run build` clean; booted the real Docker container (rebuilt `node_modules` inside it, confirmed `bcrypt`'s native binding still works via a direct functional test after an "install-scripts not covered" npm warning turned out to be informational noise, not an actual skip) and smoke-tested every REST route with `curl`: register/login/logout (including the 401 after logout), profile, search-user, get-10-random-users, add-bio, create/get/upvote/delete-post, paginated posts, comments (add/get/upvote/delete), get-chats — all returned expected status codes with no route-matching failures or crashes. Noted a pre-existing, Express-unrelated oddity (`upvote-post`/comment-upvote return an empty `{}` object) for Phase 9's regression pass, not investigated now.

## Phase 4 — Prisma 5 → 7 ✅ complete (2026-08-30)

- [x] Bump `prisma` + `@prisma/client` together, in lockstep — both landed on `^7.10.0` per Phase 2's locked decision (avoided the `8.0.0-rc.12` sitting on the `latest` npm tag). Also added `pg` (the actual Postgres driver, now required directly since the client no longer bundles a connection engine) + `@prisma/adapter-pg` (the driver adapter) + `@types/pg`.
- [x] Migrate `schema.prisma`'s `datasource { url }` to `prisma.config.ts` + adapter — removed `url = env("DATABASE_URL")` from the `datasource` block (kept `provider = "postgresql"`); added `server/prisma.config.ts` (`defineConfig({ datasource: { url: env("DATABASE_URL") } })`, used by the CLI for `generate`/`migrate`); updated `lib/prismadb.ts` to construct a `PrismaPg` adapter from `DATABASE_URL` and pass it to `new PrismaClient({ adapter })` (required — Prisma 7 has no fallback connection path without one). Kept the classic `prisma-client-js` generator (`schema.prisma`'s `generator client` block unchanged) — confirmed hands-on that switching to the newer `prisma-client` generator is *not* required in 7.10.0, despite some third-party migration guides implying otherwise; the classic generator still works fine, so this stayed a much smaller change than expected. One knock-on fix: `lib/helpers.ts` imported `DefaultArgs` from `@prisma/client/runtime/library`, a subpath that no longer exists in the v7 package exports — simplified the four `PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>` generic annotations down to plain `PrismaClient` (the `Prisma` namespace wasn't used for anything else in that file), which resolves without needing the missing subpath.
- [x] `docker-compose.yaml`/`.dockerfile`s / `DATABASE_URL` wiring — no changes needed; `prisma.config.ts` reads the same `DATABASE_URL` env var the same way, just via `prisma/config`'s `env()` helper instead of `schema.prisma`'s `env()`. Confirmed by testing.
- [x] `npx prisma generate` / `migrate status` clean (tested inside the running `server` container, since `DATABASE_URL` uses the Docker-network hostname `db:5432`, unreachable from the host directly). Rebuilt the `migration` image from scratch (`docker compose build migration`) and ran it standalone (`docker compose run --rm migration`) — `No pending migrations to apply`, exit code `0`, confirmed explicitly.
- [x] Full data-layer smoke test via `curl` against the live adapter-based client: `User` (register/login/profile), `Post` (create/read/delete), `Comment` (create), `Chat` (read) all confirmed working end to end. `Message` only writes via Socket.IO (not REST), so it needs a real socket client to exercise properly — deferred to Phase 9's full regression pass, which already specifically re-checks the Socket.IO auth handshake against this same `prismadb.ts` change.

## Phase 5 — Zod 3 → 4

- [ ] Bump `zod` to match the client's exact `4.4.x` line (currently `^4.4.3`), not independently to whatever's newest at implementation time
- [ ] Verify every method used in `server/src/lib/zod/*.ts` (`.object`, `.string`, `.min`, `.max`, `.email`, `.regex`, `{ message: ... }`) against v4's API, same verification approach as the client's zod bump
- [ ] Confirm validation error responses (shape, messages) are unchanged from the client's point of view

## Phase 6 — TypeScript & dev tooling

- [ ] Bump `typescript` to match the client's `6.0.3` per the client-compatibility directive — not independently to `7.0.2`, even though `server/` has no `typescript-eslint` blocker forcing that ceiling
- [ ] Verify `ts-node@10.9.2`/`nodemon` are happy on `6.0.3` (should be a smaller jump than TS 7 would have been); if `ts-node` still can't keep up even at this version, evaluate switching `npm run dev`'s `nodemon src/index.ts` to `tsx` (or another modern TS runner) as part of this phase, not silently
- [ ] `npm run build` (`npx tsc`) and `npm run dev` both clean

## Phase 7 — Remaining dependency bumps

- [ ] Apply the safe bucket-(a) bumps identified in Phase 2 (`@types/cookie-parser`, `@types/cors`, `@types/express` patch, `@types/formidable`, `@types/jsonwebtoken`, `cloudinary`, `cors`, `formidable`, `jsonwebtoken`, `socket.io` — pin exactly to `4.8.3` to match the client's `socket.io-client` version, per the client-compatibility directive, not just "whatever's newest")
- [ ] Apply the remaining deferred majors one at a time, each its own commit: `bcrypt` 5→6 (+ `@types/bcrypt`), `dotenv` 16→17, `@faker-js/faker` 9→10
- [ ] Re-run `npm outdated` to confirm the tree is current at the end of this phase

## Phase 8 — Build & type-check

- [ ] `npm run build` (`npx tsc`) clean
- [ ] `npm run dev` boots with no console errors/warnings
- [ ] Full `docker compose up --build` clean end to end

## Phase 9 — Behavioral regression check (manual)

Walk every server-touching feature end-to-end and confirm identical behavior to pre-upgrade:

- [ ] Register + login + logout, including the "already logged in" and "user not found"/"invalid credentials" error paths
- [ ] Post CRUD: create, get all, get paginated, get by id, get by user, delete, upvote/downvote
- [ ] Comment CRUD: add, get, delete, upvote/downvote
- [ ] Profile: bio update, profile/cover image upload via Cloudinary + `formidable`
- [ ] Search users, get 10 random users
- [ ] Realtime chat end to end (both REST fallback and live Socket.IO path): new chat creation, live message delivery, `userSocketIDs` behavior — re-verify the Socket.IO auth handshake specifically, since Phase 4's Prisma changes touch the same `prismadb.ts` that `socketAuthenticator` depends on
- [ ] Error responses: confirm shape/status codes for at least one validation error (Zod), one not-found error, and one auth error

## Phase 10 — Confirmed bug fixes (required, do only after Phase 9 passes clean)

These are real, currently-existing bugs found during the baseline audit — not optional polish. Each gets its own commit, done one at a time with the actual client-visible behavior checked before and after, per the ground rule below:

- [ ] Fix `errorMiddleware`'s arity so Express actually registers it as an error handler (add the missing `next` parameter) — confirm current client-visible error behavior first (what does a thrown error look like today, e.g. in a toast) so we know exactly what changes once this starts firing for real
- [ ] Fix `socketAuthenticator`'s missing `prisma` import — this is the production-breaking one: every Socket.IO connection currently crashes outside of dev because `global.prisma` is only set when `NODE_ENV !== "production"`
- [ ] Decide what to do with the `chat.class.ts` socket handlers' swallowed errors (`return new ErrorHandler(...)` without throwing/emitting) — likely `socket.emit` a failure event the client can react to, decided concretely in this phase
- [ ] Revisit unconditional `generateFakeUsers(100)` / `generateFakePosts()` on every boot (gate behind an env check, e.g. only seed if `NODE_ENV !== "production"` or the DB is empty)
- [ ] Add a `socket.on("disconnect", ...)` handler to clean up stale entries in `userSocketIDs`
- [ ] Re-run Phase 9's full regression checklist after this phase, since it's the one phase most likely to visibly change existing behavior (error responses, socket auth)

## Phase 11 — Wrap-up

- [ ] Update `CLAUDE.md` if any architectural pattern changed (Prisma config location, Express version, dev-server tooling)
- [ ] Final full manual pass through Phase 9's checklist on a fresh full Docker rebuild
- [ ] Open PR against `dev` (merge is the user's call)

---

**Ground rule for every phase:** if a step risks changing user-visible behavior (not just internals), stop and confirm before proceeding — don't bundle it silently into an "just upgrading" commit.
