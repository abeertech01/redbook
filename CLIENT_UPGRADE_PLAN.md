# Client Upgrade (2026-08)

React 18 → 19, Tailwind CSS v3 → v4, shadcn/ui refreshed to its current CLI/templates, and every other client dependency brought to a stable current version, without losing any existing feature or behavior. Merged via [PR #7](https://github.com/abeertech01/redbook/pull/7) (`feat/client-upgrade` → `dev`).

## Dependency changes

- `react`/`react-dom` 18 → 19 (+ `@types/react`/`@types/react-dom`)
- `tailwindcss` 3 → 4
- shadcn/ui refreshed to current CLI/templates
- `react-router-dom` 6 → 7, `zod` 3 → 4 (+ `@hookform/resolvers` 3 → 5), `lucide-react` 0 → 1, `react-resizable-panels` 2 → 4
- `typescript` 5 → 6.0.3 (not 7 — see below)
- `eslint` 9 → 10 (+ `globals`, `@eslint/js`)
- Safe bumps: `axios`, `class-variance-authority`, `react-hook-form`, `socket.io-client`, `tailwind-merge`, `@vitejs/plugin-react`, `vite`, and others
- Deliberately deferred, flagged for a future pass: `vite` 5 → 8 (bigger jump than scoped), `@types/node` 22 → 26, `tailwind-merge` 2 → 3

## Migration notes

- **React 19** — no code changes needed for the runtime bump itself (already on `createRoot`, no legacy class/ref patterns). Follow-up cleanup: removed all `forwardRef` usage from `components/ui/*` (ref is a plain prop now) and converted all 21 `React.FC` usages to plain typed functions.
- **Tailwind v4** — config moved from `tailwind.config.js` into an `@theme` block in `index.css`; the PostCSS pipeline was replaced by the `@tailwindcss/vite` plugin; `tailwindcss-animate` replaced with `tw-animate-css`. Kept HSL color values as-is rather than moving to OKLCH, to keep visual output identical.
- **shadcn/ui** — diffed every component against the current CLI output (`npx shadcn add --diff`) before touching anything, rather than blind-regenerating, since files may have been hand-customized; 6 of 12 needed real updates. `toast`/`toaster` had moved to a different registry item (`sonner`) entirely — migrated all 12 call sites, and fixed 3 bugs found along the way: a double-mounted `<Toaster/>` causing every toast to render twice, shadcn's generated `sonner.tsx` assuming an unused `next-themes`, and toast background colors losing to sonner's own CSS specificity.
- **`typescript` capped at 6.0.3, not 7** — TS 7 is a from-scratch Go rewrite; `typescript-eslint@8.68.0` hard-crashes against it with no workaround available at the time. 6.0.3 is the last JS-based release and sits within `typescript-eslint`'s supported peer range.
- **`react-resizable-panels` 2 → 4** — `defaultSize` as a raw number silently changed meaning from percent to pixels; fixed by switching to explicit `"28%"`-style strings.
- **`react-router-dom` 6 → 7** — zero source changes needed; the app only uses declarative routing, and none of v7's actual breaking changes apply.
- **`eslint` 9 → 10** — surfaced one real lint error (`preserve-caught-error` in `app/thunks/auth.ts`: a caught error was re-thrown without `{ cause: error }`), fixed.

## Bugs found and fixed

- **Realtime chat not updating live** (pre-existing, not a regression) — `SocketProvider` created its Socket.IO connection inside `useMemo`, which React doesn't guarantee runs only once. Under React 19 + StrictMode's dev double-invoke this opened two real connections per page load, and the server sometimes registered the orphaned one as "current," silently breaking delivery. Fixed by moving connection creation into `useEffect` with a real `disconnect()` cleanup. Also hardened `useSocketEvents` (was re-subscribing on every render) and fixed two related bugs: `Messages.tsx` wasn't navigating into newly-created chats, and `Inbox.tsx` showed the wrong author name above messages.
- **Nested `<button>` DOM violations** — Radix's `DropdownMenuTrigger`/`DialogTrigger` render their own `<button>` by default; wrapping a custom `<Button>` inside without `asChild` nested a button inside a button. Fixed in 3 places (Navbar's mobile menu, PostCreate's dialog trigger, Post's options menu).
- **Postgres data not persisting across container recreation** — the `pgdata` Docker volume was mounted at the wrong path.
