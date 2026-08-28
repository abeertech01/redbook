# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Redbook is a PERN-stack (PostgreSQL, Express, React, Node) social media app: posts with upvote/downvote, comments, and real-time 1:1 chat over Socket.IO. `client/` and `server/` are independent npm packages under one repo root, wired together only by `docker-compose.yaml` — there is no shared workspace/package between them.

## Commands

Client (run from `client/`):
- `npm run dev` — Vite dev server
- `npm run build` — `tsc -b && vite build`
- `npm run lint` — ESLint

Server (run from `server/`):
- `npm run dev` — `nodemon src/index.ts`
- `npm run build` — `npx tsc` (outputs to `dist/`)
- `npm run start` — `node dist/index.js` (run build first)
- `npx prisma generate` / `npx prisma migrate dev` / `npx prisma studio` — Prisma workflows

Docker (run from repo root, needs `client/.env` and `server/.env` — copy each from that folder's `example.env`):
- `docker compose up --build` — builds and starts db → migration → server → client in order
- `docker compose down` — stop (Postgres data persists in the `pgdata` volume)

Neither package has a test suite configured.

## Architecture

### Server: routes → controllers → classes
Business logic lives in singleton classes under `server/src/classes/*.class.ts` (e.g. `chat.class.ts` exports `new Chat()`). `server/src/controllers/*.controllers.ts` are thin re-exports of class methods with no logic of their own. `server/src/routes/*.routes.ts` wire controller functions to Express routes and attach `isAuthenticated` middleware. Async route handlers are wrapped in `TryCatch` (`server/src/middlewares/error.ts`), which forwards thrown errors to `errorMiddleware` instead of each handler needing its own try/catch.

### Data layer
Prisma (`server/prisma/schema.prisma`) targets PostgreSQL. `server/src/lib/prismadb.ts` exports a singleton `PrismaClient`, cached on `globalThis` outside production so it survives dev hot-reloads.

### Realtime (Socket.IO)
The Socket.IO server is created in `server/src/index.ts` on the same HTTP server as Express. Socket auth runs through `socketAuthenticator` (`server/src/middlewares/auth.ts`), reusing the same JWT cookie/verification path as HTTP requests. Connected users are tracked in an in-memory `userSocketIDs` Map (userId → socketId) in `index.ts` — not persisted, so it resets on restart and doesn't scale past one server instance. Chat events (`NEW_CHAT`, `NEW_MESSAGE`) are registered per-connection in `chat.class.ts`.

On the client, `SocketProvider` (`client/src/constants/SocketProvider.tsx`) owns the socket connection, created inside a `useEffect` (with a real `socket.disconnect()` cleanup) rather than `useMemo` — `useMemo` is documented by React as never guaranteed to run exactly once, and under React 19 + StrictMode's dev-mode double-invoke this previously opened two real connections per page load, with the server sometimes registering the orphaned, unlistened one as "current" for a user, silently breaking real-time delivery. `useSocketEvents` (`client/src/hooks/useSocketEvents.ts`) is a generic hook for subscribing a map of event→handler pairs with automatic cleanup on unmount; it holds the handlers map in a ref so it only (re)subscribes when the `socket` instance itself changes, not on every render (callers pass a fresh object literal each render, which would otherwise tear down and resubscribe constantly).

Event name constants are hand-duplicated in both packages (`server/src/constants/events.ts` and `client/src/constants/events.ts`) since there's no shared package — keep both in sync when adding a new event.

### Client state
The Redux Toolkit store (`client/src/app/store.ts`) mixes two patterns: plain slices for local UI state (`app/reducers/user.ts`, `app/reducers/post.ts`) and RTK Query API slices for server data (`app/api/{user,post,comment,chat}.ts}`), each contributing its own `reducerPath` and middleware to the store.

### Auth
JWT is stored in an httpOnly cookie and verified in `server/src/middlewares/auth.ts` for both transports: `isAuthenticated` for HTTP routes and `socketAuthenticator` for Socket.IO connections.

### Fake data seeding
`server/src/index.ts` unconditionally calls `generateFakeUsers(100)` and `generateFakePosts()` (`server/src/utils/utility.ts`, via `@faker-js/faker`) on every server boot, to keep the demo populated. This runs on every boot regardless of environment, including against an already-seeded database.

### Path alias
Client code uses `@/*` → `client/src/*`, configured in both `client/tsconfig.json` and `client/vite.config.ts`.

### Styling and UI components
Tailwind CSS v4, configured CSS-first: theme tokens (colors, radii) live in an `@theme` block in `client/src/index.css`, not a `tailwind.config.js` (deleted — v4 doesn't use one here). The `@tailwindcss/vite` plugin in `client/vite.config.ts` replaces the old PostCSS pipeline. `client/components.json` drives the shadcn/ui CLI (`npx shadcn@latest add <component> --diff` to check a component against upstream before regenerating it, since files under `client/src/components/ui/` may be hand-customized). Toasts use `sonner` (`client/src/components/ui/sonner.tsx`), not the Radix `toast`/`toaster` primitives — the shadcn registry no longer offers those for this project type. All `components/ui/*` primitives use React 19's plain `ref` prop (`{ ref, ...props }: ComponentProps & { ref?: React.Ref<...> }`) instead of `React.forwardRef`, and the app avoids `React.FC` in favor of plain typed function components.

### Docker startup order
`docker-compose.yaml` chains services with `depends_on` conditions: `db` (Postgres, `service_healthy`) → `migration` (one-shot `prisma migrate deploy`, must exit 0 via `service_completed_successfully`) → `server` → `client`. Each service loads env vars from `client/.env` or `server/.env`, which are gitignored and not committed.
