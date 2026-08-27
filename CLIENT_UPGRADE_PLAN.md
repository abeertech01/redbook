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

- [ ] Before touching anything: diff each file in `components/ui/` against a fresh `npx shadcn@latest add <component>` output in a scratch dir, to identify which components were hand-customized (don't blindly overwrite customized ones)
- [ ] Update `components.json` to the current schema/style options
- [ ] Re-generate or manually update each `ui/*.tsx` component to the latest shadcn template, re-applying any customizations found above, one component at a time
- [ ] Confirm every component still compiles against the new Tailwind v4 theme tokens from Phase 3

## Phase 5 — Remaining dependency bumps

- [ ] Apply bucket (a) safe bumps from Phase 1
- [ ] Apply the deferred bucket (c) majors one at a time (e.g. `zod` v4, `react-router-dom` v7 if in scope) — each gets its own commit and its own check against usage sites, since these have real API changes
- [ ] Re-run `npm outdated` to confirm the tree is current

## Phase 6 — Build & type-check

- [ ] `npm run build` (`tsc -b && vite build`) clean
- [ ] `npm run lint` clean
- [ ] `npm run dev` boots with no console errors/warnings

## Phase 7 — Behavioral regression check (manual, in-browser)

Walk every feature end-to-end and confirm it behaves identically to pre-upgrade:

- [ ] Register + login + logout (`AuthTabs`, `LoginForm`, `RegisterForm`, `ProtectedRoute`)
- [ ] Feed: view posts, create a post, upvote/downvote (`AllPosts`, `PostCard`, `PostCreate`)
- [ ] Post detail + comments (`pages/Post.tsx`, `Comments.tsx`)
- [ ] Profile view/edit, avatar/cover image upload via Cloudinary (`pages/Profile.tsx`)
- [ ] Search users (`SearchUser.tsx`)
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
