# Backlog

Running list of things to come back to later. Unlike the per-feature `*_PLAN.md` files (deleted once that feature ships), this file stays — it just keeps growing. Tick an item off with a ✅ to the right of its heading when it's done; leave it in place as a record rather than deleting it.

## 1. "Seen" vs "read" state for notifications ⬜

Right now a notification only has `isRead`. Facebook-style products distinguish "seen" (the dropdown was opened, so it's no longer visually "new") from "read" (the user actually clicked into it). Revisit once the notification feature ([NOTIFICATION_PLAN.md](NOTIFICATION_PLAN.md)) is live.

## 2. Pagination past "last 30" ⬜

Notification list (and possibly chat/message history, post feeds) currently plans to fetch a fixed recent window rather than true pagination/infinite scroll. Fine for a portfolio-scale dataset now; revisit if lists need to go deeper than the fixed window.

## 3. Timestamps re-rendering on every keystroke ⬜

Relative timestamps ("2 minutes ago") shown on messages, posts, comments, and elsewhere appear to recompute/re-render on every keystroke typed anywhere on the page, not just on a timer tick. Needs investigation into the actual root cause (likely an over-broad re-render trigger somewhere in state/context) before fixing.

## 4. Unread message count badge on the Home sidebar "Messages" link ⬜

[client/src/pages/Home.tsx:52-54](client/src/pages/Home.tsx#L52-L54) — the "Messages" link in the left sidebar card should show an unread count in parentheses, e.g. "Messages (3)", similar to how the notification bell will show an unread badge.
