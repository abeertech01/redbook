# Backlog

Running list of things to come back to later. Unlike the per-feature `*_PLAN.md` files (deleted once that feature ships), this file stays — it just keeps growing. Tick an item off with a ✅ to the right of its heading when it's done; leave it in place as a record rather than deleting it.

## 1. "Seen" vs "read" state for notifications ⬜

Right now a notification only has `isRead`. Facebook-style products distinguish "seen" (the dropdown was opened, so it's no longer visually "new") from "read" (the user actually clicked into it). Revisit once the notification feature ([NOTIFICATION_PLAN.md](NOTIFICATION_PLAN.md)) is live.

## 2. Pagination past "last 30" ⬜

Notification list (and possibly chat/message history, post feeds) currently plans to fetch a fixed recent window rather than true pagination/infinite scroll. Fine for a portfolio-scale dataset now; revisit if lists need to go deeper than the fixed window.

## 3. Timestamps re-rendering on every keystroke ⬜

Partial progress, not actually resolved — reopened after further reports showed the same symptom from causes this pass didn't touch.

Fixed so far: two over-broad re-render triggers where a component *far above* a list in the tree re-rendered the whole subtree for unrelated reasons — `Home.tsx` calling `useGetUnreadMessageCountQuery()` directly (fixed by extracting to [MessagesSidebarLink.tsx](client/src/components/MessagesSidebarLink.tsx)), and `Inbox.tsx`'s `NEW_MESSAGE` handler refetching unconditionally for any chat, not just the open one (fixed by gating on `chatId` match).

Still open — a different, more pervasive cause: `timeAgo()` is computed inline during render with no memoization, and list items (`PostCard`, individual comments, individual messages) aren't wrapped in `React.memo`. So *any* re-render of a component for an unrelated reason (typing in a comment/message box whose state lives above the list, a vote mutation's `isLoading` flipping) recomputes and can visually change every timestamp in that render pass, even though nothing about the timestamps themselves changed. Needs: memoizing the per-item relative-time computation (`useMemo` keyed on the timestamp, or a small memoized `<TimeAgo>` component), moving comment/message input state into its own child component so typing doesn't cascade into the sibling list, and wrapping list-item components in `React.memo`.

## 4. Unread message count badge on the Home sidebar "Messages" link ⬜

[client/src/pages/Home.tsx:52-54](client/src/pages/Home.tsx#L52-L54) — the "Messages" link in the left sidebar card should show an unread count in parentheses, e.g. "Messages (3)", similar to how the notification bell will show an unread badge.
