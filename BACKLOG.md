# Backlog

Running list of things to come back to later. Unlike the per-feature `*_PLAN.md` files (deleted once that feature ships), this file stays — it just keeps growing. Tick an item off with a ✅ to the right of its heading when it's done; leave it in place as a record rather than deleting it. An item marked 🔴 High Priority should be picked up before unmarked ones.

## 1. "Seen" vs "read" state for notifications ⬜

Right now a notification only has `isRead`. Facebook-style products distinguish "seen" (the dropdown was opened, so it's no longer visually "new") from "read" (the user actually clicked into it). Revisit once the notification feature ([NOTIFICATION_PLAN.md](NOTIFICATION_PLAN.md)) is live.

## 2. Pagination past "last 30" ⬜

Notification list (and possibly chat/message history, post feeds) currently plans to fetch a fixed recent window rather than true pagination/infinite scroll. Fine for a portfolio-scale dataset now; revisit if lists need to go deeper than the fixed window.

## 3. Timestamps re-rendering on every keystroke ✅

Two layers to this, fixed in two passes:

- Cross-page cascades — a component *far above* a list re-rendered the whole subtree for unrelated reasons: `Home.tsx` calling `useGetUnreadMessageCountQuery()` directly (fixed by extracting to [MessagesSidebarLink.tsx](client/src/components/MessagesSidebarLink.tsx)), and `Inbox.tsx`'s `NEW_MESSAGE` handler refetching unconditionally for any chat, not just the open one (fixed by gating on `chatId` match).
- In-place re-renders — `timeAgo()` was computed inline during render with no memoization, so *any* re-render of the containing component for an unrelated reason (typing in a comment/message box whose state lives above the list, a vote mutation's `isLoading` flipping, a fresh comment list refetch) recomputed and could visually change every timestamp in that render pass, even though the timestamps themselves hadn't changed. Fixed with a single shared [TimeAgo.tsx](client/src/components/TimeAgo.tsx) component wrapped in `React.memo`, used everywhere `timeAgo()` was previously called inline (`PostCard`, `Comments`, `Inbox`, `Messages`, `Post`, `NotificationBell`). Since `createdAt`/`updatedAt` values are primitive strings at runtime, `React.memo`'s prop comparison bails out correctly even across full list refetches with entirely new object references — no need to also memoize the list-item components themselves or restructure input state.

Verified via render-count instrumentation against the exact three reported scenarios (typing in the message box, upvoting a post, adding a comment) — zero unrelated `TimeAgo` re-renders in all three, confirmed against a StrictMode-aware baseline (StrictMode double-invokes newly-mounted components' renders in dev, which is expected and unrelated to this bug).

## 4. Unread message count badge on the Home sidebar "Messages" link ⬜

[client/src/pages/Home.tsx:52-54](client/src/pages/Home.tsx#L52-L54) — the "Messages" link in the left sidebar card should show an unread count in parentheses, e.g. "Messages (3)", similar to how the notification bell will show an unread badge.

## 5. Hover tooltip for exact timestamp ⬜

Idea: Messenger-style — hovering over a relative timestamp ("3 minutes ago") shows a tooltip with the real/exact date-time. Explicitly flagged by the user as a pattern they're unsure about ("having a feeling this way of showing the real message time is wrong or bad UX") — revisit whether this is even the right approach before implementing the tooltip itself.

## 6. Responsive / mobile-friendly design 🔴 High Priority ⬜

App is partially responsive at best, leaning desktop-only. Audit findings:

- A viewport meta tag exists (`client/index.html`) and a few pages show deliberate mobile consideration — `Navbar.tsx` has a real `md:hidden` hamburger menu (though its items are placeholders with no `onClick` handlers), `Home.tsx`'s 3-column grid collapses to stacked blocks below `md`, and `Profile.tsx` is the most genuinely responsive page (scales avatar/cover/text, grid drops to one column below `lg`).
- Two flows are actively broken on a phone-sized viewport: `Post.tsx` has a fixed `w-188` (752px) with no breakpoint override, causing overflow/clipping; `Messages.tsx`/`Inbox.tsx` use `ResizablePanelGroup` in a hardcoded horizontal 3-panel layout (chat list / conversation / participant info) with no mobile fallback, crushing everything into unusable slivers.
- Everything else (`AllPosts`, `PostCard`, `PostCreate`, `Login`) has no explicit breakpoints but is naturally fluid, so it degrades acceptably by inheriting whatever width its parent gives it.

Scope: make the whole app usable at mobile widths, not just patch the two broken flows — includes wiring up the Navbar's dead hamburger menu items to the app's actual features.

## 7. Migrate database from PostgreSQL/Prisma to MongoDB/Mongoose ⬜

Full data-layer swap, not an incremental change. Touches:

- `server/prisma/schema.prisma` → Mongoose schemas (User, Post, Comment, Chat, Message, Notification), including how Prisma relations (`@relation`, explicit named relations like `NotificationRecipient`/`NotificationActor`) get re-expressed as Mongoose refs/`populate()` or embedded documents.
- `server/src/lib/prismadb.ts`'s singleton (`PrismaClient` + `PrismaPg` driver adapter) → a Mongoose connection singleton, same cross-hot-reload caching concern on `globalThis` outside production.
- Every `prisma.<model>.<method>()` call across `server/src/classes/*.class.ts` and `server/src/lib/helpers.ts` → Mongoose equivalents (different query builder, no `include`/`select` shape, different transaction story).
- `server/prisma.config.ts`, the `prisma/migrations/` directory, and the `migration` Docker service (`prisma migrate deploy`) all go away — Mongoose has no migration system, so schema evolution strategy needs deciding.
- `docker-compose.yaml`'s `db` service (Postgres image) → MongoDB image; env vars (`DATABASE_URL` shape changes entirely).
- `package.json` deps: drop `@prisma/client`, `@prisma/adapter-pg`, `prisma`; add `mongoose`.
- Re-verify every feature built against Prisma assumptions so far (notifications' `distinct` dedup query in `getUnreadCount`, the vote-array fields on Post/Comment, etc.) still expresses cleanly in Mongoose.
