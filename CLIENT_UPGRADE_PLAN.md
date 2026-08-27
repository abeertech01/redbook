# Client Upgrade Plan

Scope: `client/` only (server upgrades are a separate, later effort). Goal: React 18 → 19, Tailwind CSS v3 → v4, shadcn/ui refreshed to its current CLI/templates, and every other client dependency brought to a stable latest version — all **without losing any existing feature or behavior**.

Work through phases in order; check items off as completed. Each phase = one commit, so a regression can be bisected/reverted without dragging unrelated changes with it.

## Baseline audit (already done, informing this plan)

- React: already on `createRoot`, no class components, no `defaultProps`/`PropTypes`, no string refs, no `findDOMNode` — the classic React-19 breakers aren't present. Only hotspot: ~12 `shadcn/ui` files under `client/src/components/ui/` use `React.forwardRef` (`card.tsx`, `label.tsx`, `avatar.tsx`, `tabs.tsx`, `toast.tsx`, `dropdown-menu.tsx`, `button.tsx`, `form.tsx`, `scroll-area.tsx`, `input.tsx`, `dialog.tsx`, `textarea.tsx`) — still works in 19 (deprecated, not removed), cleanup opportunity not a blocker.
- Tailwind: currently v3-style setup — `tailwind.config.js` (JS config object), `postcss.config.js` using the `tailwindcss` + `autoprefixer` plugins, `@tailwind base/components/utilities` directives in `src/index.css`, colors defined as raw HSL triples in CSS variables, plus the `tailwindcss-animate` plugin. Tailwind v4 changes all of this: config moves into the CSS file itself via `@theme`, the PostCSS plugin is renamed (`@tailwindcss/postcss`) or replaced entirely by the `@tailwindcss/vite` plugin, `tailwindcss-animate` needs a v4-compatible replacement (commonly `tw-animate-css`), and the single `@import "tailwindcss";` replaces the three `@tailwind` directives.
- shadcn/ui: `components.json` shows the older `"style": "default"` template with HSL CSS variables and the legacy `tailwind.config` pointer. Current shadcn CLI defaults have moved on (newer style options, OKLCH color format, `data-slot` attributes on primitives). The `ui/*.tsx` files were generated once and may have been hand-edited since — **must diff before overwriting**, not blindly regenerate.
- Other client dependencies with a `react` peer range to verify for React 19 support: `react-redux`, `react-router-dom`, `react-hook-form`, `@hookform/resolvers`, `react-resizable-panels`, `@uidotdev/usehooks`, all `@radix-ui/react-*` packages.
- Known majors likely waiting in `npm outdated` that need individual attention rather than a blind bump: `react-router-dom` (v6 → v7 renamed some import paths and internals), `zod` (v3 → v4 has breaking API changes), `vite`/`@vitejs/plugin-react` (major version jumps), `tailwindcss-animate` (unmaintained under Tailwind v4, needs replacing). Full list to be confirmed in Phase 1.

## Phase 0 — Setup

- [x] Confirm current app still runs cleanly via `docker compose up` (last verified working)
- [x] Create a dedicated branch for this work
- [x] Record current versions as a rollback reference (`react@18.3.1`, `tailwindcss@3.4.14`, etc. — full snapshot via `npm ls --depth=0` in `client/`)

## Phase 1 — Full dependency audit

- [x] Run `npm outdated` in `client/` to get the real current-vs-latest table for every dependency and devDependency
- [x] Sort into three buckets: (a) safe patch/minor bumps, (b) majors needing peer-compat verification only (React 19 support), (c) majors with actual breaking-change migration work (Tailwind v4, possibly `react-router-dom` v7, `zod` v4, `vite`)
- [x] For bucket (b), check each package's latest version peer-declares React 19 support: `react-redux`, `react-hook-form`, `@hookform/resolvers`, `react-resizable-panels`, `@uidotdev/usehooks`, all `@radix-ui/react-*`
- [x] Decide, per bucket-(c) package, whether to upgrade now or defer (e.g. `react-router-dom` v7 is a bigger lift — confirm before including it in this pass)

## Phase 2 — React 18 → 19

- [x] Bump `react`, `react-dom` to `^19.x`; bump `@types/react`, `@types/react-dom` to `^19.x`
- [x] Bump the React-19-verified packages from Phase 1
- [x] Bump `eslint-plugin-react-hooks` if a newer major is needed for React 19's lint rules
- [x] `npm install`, resolve peer-dependency conflicts
- [x] `npm run build` and `npm run lint` clean

## Phase 3 — Tailwind CSS v3 → v4

- [x] Install `tailwindcss@4` and switch the PostCSS setup: either `@tailwindcss/postcss` in `postcss.config.js`, or (preferred for Vite) swap to the `@tailwindcss/vite` plugin in `vite.config.ts` and drop `postcss.config.js`/`autoprefixer` entirely
- [x] Replace `@tailwind base; @tailwind components; @tailwind utilities;` in `src/index.css` with `@import "tailwindcss";`
- [x] Port `tailwind.config.js`'s `theme.extend` (colors, `borderRadius`) into an `@theme` block in CSS — kept HSL CSS variables as-is (still valid) rather than moving to OKLCH, to keep visual output identical
- [x] Replace `tailwindcss-animate` with a Tailwind-v4-compatible equivalent (e.g. `tw-animate-css`) and update the import
- [x] Rebuild and visually verify: `darkMode` class-toggling, border radii, chart colors, and every custom color token (`background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`) still render identically in both light and dark mode

## Phase 4 — shadcn/ui refresh

- [x] Before touching anything: diff each file in `components/ui/` against a fresh `npx shadcn@latest add <component>` output in a scratch dir, to identify which components were hand-customized (don't blindly overwrite customized ones) — used `npx shadcn@latest add <component> --diff` directly instead of a manual scratch-dir diff, same result
- [x] Update `components.json` to the current schema/style options
- [x] Re-generate or manually update each `ui/*.tsx` component to the latest shadcn template, re-applying any customizations found above, one component at a time — 6 components had real changes (card, dropdown-menu, input, form, textarea, dialog), applied; 6 others (avatar, button, label, resizable, scroll-area, tabs) reported no changes. `toast`/`toaster` had moved to a different registry item entirely (`sonner`) — migrated separately, see below
- [x] Confirm every component still compiles against the new Tailwind v4 theme tokens from Phase 3 — build and lint clean

**Additional work that came out of the diff (not originally scoped, but necessary):**

- Migrated `toast`/`toaster` (Radix-based, no longer offered by the registry for this project type) to `sonner`, updating all 12 call sites across the app
- Fixed shadcn's generated `sonner.tsx` assuming `next-themes` (unused in this project) instead of the app's actual `ThemeProvider`
- Fixed a pre-existing bug: `<Toaster />` was mounted twice (`main.tsx` and `App.tsx`), causing every toast to render twice
- Fixed toast background colors: sonner's own CSS (`[data-sonner-toast][data-styled='true']`) was overriding our Tailwind classes via specificity; fixed by setting sonner's own CSS custom properties directly instead

## Phase 5 — Remaining dependency bumps

- [x] Apply bucket (a) safe bumps from Phase 1 (`@eslint/js`, `@hookform/resolvers`, `@types/node`, `@vitejs/plugin-react`, `axios`, `class-variance-authority`, `eslint`, `eslint-plugin-react-refresh`, `globals`, `react-hook-form`, `socket.io-client`, `tailwind-merge`, `typescript-eslint`, `vite`)
- [x] Apply the deferred bucket (c) majors one at a time — each gets its own commit and its own check against usage sites, since these have real API changes:
  - [x] `lucide-react` 0.x → 1.x — verified every icon name we use (22 across 10 files) still exists unchanged; no source changes needed, version bump only
  - [x] `react-resizable-panels` 2.x → 4.x — `PanelGroup`/`PanelResizeHandle` renamed to `Group`/`Separator`, `direction` prop renamed to `orientation`, and critically `defaultSize` as a raw number now means pixels instead of percent (was silently going to shrink the layout to slivers); fixed by switching to explicit `"28%"`-style strings. Verified live: drag-resize confirmed working
  - [x] `react-router-dom` 6.x → 7.x — app only uses declarative routing (`BrowserRouter`/`Routes`/`Route`/`Navigate`/`Outlet`/`Link`/`useNavigate`/`useParams`/`useLocation`), no splat routes, no relative navigation, no data-router APIs (`loader`/`action`/`createBrowserRouter`) — none of v7's actual breaking changes apply, so this was a clean version bump with zero source changes. Build and lint clean. Verified live: navigation confirmed working
  - [x] `zod` 3.x → 4.x + `@hookform/resolvers` 3.x → 5.x (tracks zod) — verified every zod method used (`.object`, `.string`, `.min`, `.max`, `.email`, `.regex`, `.refine`, all with `{ message: "..." }`) still works in v4 by reading zod's source directly; `message` param is deprecated in favor of `error` but still fully supported. `@hookform/resolvers@5` explicitly peers on `zod ^4.0.0`. Build and lint clean. Verified live: Login and Register forms (validation + submit) confirmed working
  - [x] `typescript` 5.x → 7.x — **deferred, upgraded to 6.0.3 instead.** TS 7 is a ground-up rewrite of the compiler in Go (not an incremental JS update); confirmed live that `typescript-eslint@8.68.0` hard-crashes against it (`typescript-eslint does not support TS 7.0`) with no workaround available yet (tracked upstream, not fixed as of this pass). TS 6.0.3 is the last JS-based release line and is explicitly within `typescript-eslint`'s supported peer range (`>=4.8.4 <6.1.0`) — verified clean build and lint with no peer conflicts
  - [x] `eslint` 9.x → 10.x + `globals` 15.x → 17.x + `@eslint/js` 9.x → 10.x (must track eslint's major in lockstep) — clean bump, all plugins (`typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`) already supported eslint 10 at their current pinned versions. Surfaced one new real lint error from eslint 10's updated recommended rules: `preserve-caught-error` in `app/thunks/auth.ts` (re-throwing a caught error without attaching the original via `{ cause: error }`, losing the debugging trail) — fixed by adding `cause`, which required adding `ES2022.Error` to `tsconfig.app.json`'s `lib` array (kept `target` at ES2020, only unlocked the newer `Error` type declarations, no output-syntax change)
- [x] Re-run `npm outdated` to confirm the tree is current — clean for everything this phase covered. New majors have appeared since the original Phase 1 audit that were never in this phase's scope: `vite` (5→8, three majors, a much bigger and riskier jump than originally scoped), `@vitejs/plugin-react` (4→6, tracks vite), `@types/node` (22→26), `tailwind-merge` (2→3), `eslint-plugin-react-refresh` (0.4→0.5). Left alone for now — flagged for a future pass, not silently pulled into this one

## Phase 6 — Build & type-check

- [x] `npm run build` (`tsc -b && vite build`) clean
- [x] `npm run lint` clean
- [x] `npm run dev` boots with no console errors/warnings — found and fixed 3 pre-existing (not caused by this upgrade) nested-`<button>` DOM violations surfaced by checking the browser console carefully: Navbar's mobile menu, PostCreate's "Create A Post" dialog trigger, and Post's options menu. Root cause: Radix's `DropdownMenuTrigger`/`DialogTrigger` render their own `<button>` by default, so wrapping our own `<Button>` inside them without `asChild` nested a button inside a button (invalid HTML). Fixed by adding `asChild` to each. Verified live: console clean on hard reload of Home and on a self-authored Post page

## Phase 7 — Behavioral regression check (manual, in-browser)

Walk every feature end-to-end and confirm it behaves identically to pre-upgrade:

- [x] Register + login + logout (`AuthTabs`, `LoginForm`, `RegisterForm`, `ProtectedRoute`)
- [x] Feed: view posts, create a post, upvote/downvote (`AllPosts`, `PostCard`, `PostCreate`)
- [x] Post detail + comments (`pages/Post.tsx`, `Comments.tsx`)
- [x] Profile view/edit, avatar/cover image upload via Cloudinary (`pages/Profile.tsx`)
- [x] Search users (`SearchUser.tsx`)
- [ ] Real-time chat: new chat, send/receive messages live via Socket.IO (`pages/Messages.tsx`, `Inbox.tsx`, `ChatParticipator.tsx`, `SocketProvider.tsx`, `useSocketEvents.ts`)
- [ ] Theme toggle (light/dark) persists correctly (`ThemeProvider.tsx`, `ThemeToggle.tsx`)
- [ ] All Radix-based UI (dialogs, dropdowns, tabs, toasts, scroll areas) opens/closes/animates correctly, including any `tailwindcss-animate` → replacement animation classes

## Phase 8 — Best-practices cleanup (optional, do only after Phase 7 passes clean)

Pure refactor, no behavior change — do last, re-run Phase 7's smoke checks after.

- [ ] Remove `forwardRef` wrappers in `components/ui/*` now that `ref` can be a normal prop in React 19
- [ ] Review `React.FC` typing usage (21 occurrences) — simplify where it clearly helps (style choice, discuss before doing broadly)

## Phase 9 — Wrap-up

- [ ] Update `CLAUDE.md` if React/Tailwind version or any architectural pattern changed
- [ ] Final full manual pass through Phase 7's checklist
- [ ] Open PR / merge

---

**Ground rule for every phase:** if a step risks changing user-visible behavior (not just internals), stop and confirm before proceeding — don't bundle it silently into an "just upgrading" commit.
