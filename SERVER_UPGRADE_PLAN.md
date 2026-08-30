# Server Upgrade (2026-08)

Express 4 → 5, Prisma 5 → 7, Zod 3 → 4, Node 20 → 24, TypeScript 5 → 6.0.3, and every other server dependency brought to a stable current version, without losing any existing feature or behavior. Mirrors the approach in [CLIENT_UPGRADE_PLAN.md](CLIENT_UPGRADE_PLAN.md). Merged via [PR #9](https://github.com/abeertech01/redbook/pull/9) (`feat/server-upgrade` → `dev`).

## Dependency changes

- Node runtime (Docker): 20 → 24 (Active LTS; Node 20 reached EOL 2026-04-30)
- `express` 4 → 5 (`^5.2.1`)
- `prisma`/`@prisma/client` 5 → 7 (`^7.10.0`), plus new `pg`/`@prisma/adapter-pg`/`@types/pg`
- `zod` 3 → 4 (`4.4.3`, matching the client exactly)
- `typescript` 5 → 6.0.3 (matching the client)
- `bcrypt` 5 → 6, `dotenv` 16 → 17, `@faker-js/faker` 9 → 10
- `socket.io` bumped to `4.8.3` to match the client's `socket.io-client`
- Safe patch/minor bumps: `@types/*`, `cloudinary`, `cors`, `formidable`, `jsonwebtoken`
- Deliberately held back from "latest": `@types/node` (pinned to the 24.x runtime line, not 26.x), `prisma` (locked to `7.10.0`, not the `8.0.0` release candidate sitting on npm's `latest` tag)

## Migration notes

- **Node 20 → 24** — chose the newer Active LTS (EOL 2028) over the more conservative 22 (what the host machine/client run), since Docker fully isolates the container runtime and there's no reason to match either. Added `server/.nvmrc` for anyone running server commands directly on the host.
- **Cross-package version matching** — for any dependency that exists in both `client/` and `server/` (`zod`, `typescript`, and the `socket.io`/`socket.io-client` pairing), server was pinned to the client's exact version rather than independently chasing latest, keeping the whole repo on one consistent version despite there being no shared workspace. `@types/node` was explicitly excluded from this rule: it's compile-time-only and should describe the actual runtime, not mirror a sibling package.
- **Express 4 → 5** — zero source changes needed: no deprecated APIs in use, no optional/wildcard route patterns, and every `req.query` usage is a flat string (unaffected by v5's query-parser default change).
- **Prisma 5 → 7** — the connection URL moved out of `schema.prisma`'s `datasource` block into a new `prisma.config.ts`; `lib/prismadb.ts` now builds a `PrismaPg` driver adapter and passes it to `PrismaClient`, since v7 has no connection fallback without one. Locked deliberately at `7.10.0` rather than "latest," since the `prisma` CLI package's `latest` npm tag pointed at an `8.0.0` release candidate. Kept the classic `prisma-client-js` generator — confirmed hands-on that switching to the newer generator isn't required in 7.10.0, despite some third-party guides implying otherwise. One knock-on fix: `lib/helpers.ts` imported a type from `@prisma/client/runtime/library`, a subpath removed in v7 — simplified to plain `PrismaClient`.
- **TypeScript 6.0.3** — TS 6 errors by default on the deprecated classic `moduleResolution: "Node"` setting; migrating to `NodeNext`/`Node16` would be a real behavioral change to import resolution, so used TypeScript's own suggested `ignoreDeprecations: "6.0"` escape hatch instead.
- **`bcrypt` 5 → 6** — native binding rebuilds cleanly under Node 24, now using `node-gyp-build` instead of the old `node-pre-gyp`.

## Bugs found and fixed

- **`socketAuthenticator` would crash every Socket.IO connection in production** (the most severe bug found) — it referenced `prisma` without importing it, relying on an ambient global that `lib/prismadb.ts` only populates outside production. Reproduced live by temporarily setting `NODE_ENV=production` and attempting a real connection — confirmed `ReferenceError: prisma is not defined`. Fixed with a one-line import; reconfirmed working under both production and dev modes.
- **`errorMiddleware` was dead code** — declared with 3 parameters instead of the 4 Express requires to register error-handling middleware, so every error fell through to Express's default HTML error page instead of the app's JSON shape. Fixed by adding the missing `next` parameter. While in this path, also fixed `ZodError` responses returning `500` instead of `400` with an unreadable stringified-JSON message — added a dedicated branch returning `400` with a clean message and a structured `errors` array.
- **Chat socket errors were silently swallowed** — `newChat`/`newMessage` constructed error objects and discarded them, with no log and no client feedback. Added a `CHAT_ERROR` event (server *and* client — an explicit exception was granted for this one fix) that the client's `SocketProvider` listens for globally and surfaces as a toast. Verified with a real socket connection and a Playwright-driven browser session, and discovered along the way that "chat already exists" can never actually be triggered through normal UI navigation, since search permanently excludes existing chat friends.
- **Vote endpoints always returned an empty `{}`** — the real cause was a missing `await` at all four call sites in `post.class.ts`/`comment.class.ts` (not just the missing `return` in the helper functions first suspected), so `res.json()` was serializing an unresolved `Promise`. Fixed both.
- **`userSocketIDs` never cleaned up on disconnect** — added a handler that removes a user's entry, guarded against a race where a user with two tabs open could have a still-valid newer connection wiped out by an older tab's delayed disconnect event.
- **Unconditional fake-data seeding on every boot** — reviewed and confirmed intentional: this is a portfolio project where a populated-looking demo matters even when deployed, not a service with real user data to protect. No change made.

## Known follow-up

`client.dockerfile` is still on `node:20` (EOL) — tracked separately since this upgrade was scoped server-only.
