# Notification Feature — Implementation Plan

Adds a Facebook-style notification system: a bell icon with an unread badge in the navbar, a dropdown listing recent notifications, realtime delivery over the existing Socket.IO connection, and click-to-navigate to the source (post or chat). Delete this file once the feature is built and verified — `CLIENT_UPGRADE_PLAN.md` and `SERVER_UPGRADE_PLAN.md` stay.

## What triggers a notification (v1 scope)

- New chat message → notify the other chat member(s)
- New comment on your post → notify the post author
- Upvote on your post → notify the post author
- Downvote on your post → notify the post author

Self-notifications are always suppressed (commenting/voting on your own post, or otherwise being both actor and recipient, never creates a row).

Deliberately out of scope for v1 (flagged for later, not forgotten): votes/comments on *comments* generating their own notifications, mute/preferences, email/push digests, a separate "seen" vs "read" state, pagination past a simple "last 30." Keeping v1 to the four triggers above matches exactly what was asked for and keeps the first pass small enough to verify by hand.

## Data model

New `Notification` model + `NotificationType` enum in `server/prisma/schema.prisma`:

```prisma
enum NotificationType {
  NEW_MESSAGE
  NEW_COMMENT
  POST_UPVOTE
  POST_DOWNVOTE
}

model Notification {
  id          String            @id @default(uuid())
  type        NotificationType
  isRead      Boolean           @default(false)
  createdAt   DateTime          @default(now())
  recipientId String
  recipient   User              @relation("NotificationRecipient", fields: [recipientId], references: [id], onDelete: Cascade)
  actorId     String
  actor       User              @relation("NotificationActor", fields: [actorId], references: [id], onDelete: Cascade)
  postId      String?
  post        Post?             @relation(fields: [postId], references: [id], onDelete: Cascade)
  chatId      String?
  chat        Chat?             @relation(fields: [chatId], references: [id], onDelete: Cascade)

  @@index([recipientId, isRead])
  @@map("notifications")
}
```

Deliberately **not** storing a denormalized sentence like "John commented on your post." Store just `type` + `actorId` + `postId`/`chatId`, and let the client compose the sentence from `actor.name` at render time via a small per-type lookup table. Keeps it correct if a user renames later, and keeps the row small.

Needs matching back-relations added to `User` (`notificationsReceived`, `notificationsSent` — two relations to the same model need explicit relation names, as sketched above), `Post` (`notifications`), and `Chat` (`notifications`).

## Phase 1 — Schema & migration

- [x] Add the model/enum/relations above to `schema.prisma`
- [x] `npx prisma migrate dev --name add_notifications`
- [x] `npx prisma generate`

## Phase 2 — Notification creation helper (server)

- [x] Add `createNotification({ prisma, io, recipientId, actorId, type, postId?, chatId? })` to `server/src/lib/helpers.ts`. It: no-ops if `recipientId === actorId`; writes the row via `prisma.notification.create(...)`; looks up the recipient's live socket via the existing `userSocketIDs` map (same import `chat.class.ts` already uses: `import { userSocketIDs } from ".."`); if online, `io.to(socketId).emit(NEW_NOTIFICATION, notification)`.
- [x] Wire it into the three existing write paths, right after each DB write succeeds:
  - `comment.class.ts` → `addcomment` (recipient = `post.authorId`)
  - `post.class.ts` → `upvotePost` / `downvotePost` (recipient = `post.authorId`; only on the "vote added" or "vote switched" branches inside `upvotePostHelper`/`downvotePostHelper` in `helpers.ts` — never on the "vote removed" branch, since un-voting isn't something worth notifying about)
  - `chat.class.ts` → the `newMessage` socket handler (recipient = each chat member except the sender)
- [x] `post.class.ts`/`comment.class.ts` are plain Express controllers, not socket handlers, so they don't have `io` in scope like `chat.class.ts` does — pull it via `req.app.get("io")` (already registered with `app.set("io", io)` in `index.ts`).

## Phase 3 — REST API (server)

- [x] `server/src/classes/notification.class.ts` (new, same three-layer pattern as the rest of the app):
  - `getNotifications` — last 30 for `req.id`, newest first, `include: { actor: true, post: true, chat: true }`
  - `getUnreadCount` — `prisma.notification.count({ where: { recipientId: req.id, isRead: false } })`
  - `markAsRead` — `PUT /:id/read`, scoped to `recipientId: req.id` so one user can't mark another's notification read
  - `markAllAsRead` — `PUT /read-all`
- [x] `server/src/controllers/notification.controllers.ts` — thin re-exports, matching the existing pattern
- [x] `server/src/routes/notification.routes.ts` — `isAuthenticated`-gated, mounted at `/api/notification` in `index.ts`

## Phase 4 — Realtime event (server + client constants)

- [x] Add `NEW_NOTIFICATION` to both `server/src/constants/events.ts` and `client/src/constants/events.ts` — hand-kept in sync, same as `CHAT_ERROR` already is.

## Phase 5 — Client data layer

- [x] `client/src/app/api/notification.ts` — new RTK Query slice (`notificationAPI`) with `getNotifications`, `getUnreadCount`, `markAsRead`, `markAllAsRead`, tags wired so marking read invalidates the count
- [x] Register it in `client/src/app/store.ts` (reducer + middleware, same pattern as the other three API slices)

## Phase 6 — Notification bell + dropdown (client UI)

- [x] Add a bell icon (lucide `Bell`) to `Navbar.tsx`, left of the existing avatar dropdown, with an unread-count badge from `useGetUnreadCountQuery`
- [x] Dropdown (shadcn `DropdownMenu`, the same primitive already used for the avatar menu) listing the last 30 notifications — each row rendering `{actor.name} {verb for type} {your post | you}` plus a relative timestamp, unread rows visually distinct
- [x] "Mark all as read" action in the dropdown header

## Phase 7 — Realtime listener + click-to-navigate

- [x] Subscribe to `NEW_NOTIFICATION`, either by extending the existing global listener in `SocketProvider.tsx` (same place `CHAT_ERROR` is handled today) or adding it where the notification list lives. On receipt: prepend to the RTK Query cache via `notificationAPI.util.updateQueryData` and bump the unread count — the same optimistic-cache pattern already used for votes in `app/api/post.ts`/`comment.ts`.
- [x] Row click → call `markAsRead(id)`, then navigate:
  - `NEW_COMMENT` / `POST_UPVOTE` / `POST_DOWNVOTE` → `/post/:postId`
  - `NEW_MESSAGE` → `/messages/:chatId`

## Phase 8 — Verification

- [x] Docker rebuild, run the migration container, confirm the new table exists
- [x] Manual matrix with two logged-in browser sessions: trigger a chat message, a comment, an upvote, and a downvote — confirm the DB row, the realtime badge/toast update while both users are online, and correct persisted state (unread count, dropdown contents) when the recipient logs in later instead of being online at trigger time
- [x] Confirm self-notification suppression (commenting/voting on your own post creates no row)
- [x] Confirm click-through lands on the right post/chat and marks the row read

## Phase 9 — Split message count (sidebar) from activity count (bell)

Correction to the v1 scope: the bell was showing a raw unread-notification count that mixed messages in with comments/votes. The actual design has two separate counters with two separate counting rules:

- **Sidebar "Messages" link** (`client/src/pages/Home.tsx`, next to the existing `Messages` link): a literal, non-deduplicated count of unseen individual messages. Bob sends 4 messages + Carol sends 2 → `Messages(6)`.
- **Bell icon badge**: excludes the raw message count entirely. Instead it counts distinct `(actorId, type)` pairs with unread notifications, across all four types including `NEW_MESSAGE` — so a person still shows up on the bell when they message you, just deduplicated by person+type rather than by raw volume. Bob sending 4 messages contributes `1`; if Dave and Eve each comment once, that's `+2` more, independent of Bob's message count. Same person + same type again (Bob sends 3 more messages) → no change, already counted. Same person doing a *different* type (Bob also upvotes your post) → `+1` more, since dedup key is `(actorId, type)`, not `actorId` alone.
- The bell's **dropdown list** (last 30) is unaffected by this — it keeps showing one row per individual notification, unchanged from Phase 6. Only the **badge number** uses the deduplicated logic.
- No schema change needed — every message send already creates one `NEW_MESSAGE` notification row per recipient (Phase 2), so the sidebar count is just `count(unread NEW_MESSAGE notifications)` for the current user.
- New behavior required: opening a chat currently only marks things read via the bell's row click. It needs to also mark that chat's `NEW_MESSAGE` notifications as read on open, so the sidebar count decrements correctly.

### Server

- [x] `notification.class.ts`: add `getUnreadMessageCount` — `prisma.notification.count({ where: { recipientId: req.id, type: "NEW_MESSAGE", isRead: false } })`, for the sidebar.
- [x] `notification.class.ts`: change `getUnreadCount` to exclude the raw-count semantics and instead return the deduplicated activity count — `prisma.notification.findMany({ where: { recipientId: req.id, isRead: false }, distinct: ["actorId", "type"], select: { actorId: true, type: true } })`, and respond with `.length`. (Note: this changes existing behavior from Phase 3 — the bell's count endpoint now dedupes across *all* types including `NEW_MESSAGE`, rather than counting every unread row 1:1.)
- [x] `notification.class.ts`: add `markChatNotificationsAsRead` — `PUT /chat/:chatId/read`, scoped to `recipientId: req.id`, `chatId`, `type: "NEW_MESSAGE"`, `isRead: false` → `updateMany(... isRead: true)`.
- [x] Wire the new method through `notification.controllers.ts` and `notification.routes.ts`, same pattern as the rest of Phase 3.

### Client

- [x] `client/src/app/api/notification.ts`: add `getUnreadMessageCount` query and `markChatNotificationsAsRead` mutation (invalidating the same tags `getUnreadCount`/`getUnreadMessageCount` depend on).
- [x] `client/src/pages/Home.tsx`: render `Messages (N)` next to the existing "Messages" link using `useGetUnreadMessageCountQuery`, hiding the `(N)` when it's 0.
- [x] `client/src/pages/Inbox.tsx`: on mount / `chatId` change, call `markChatNotificationsAsRead(chatId)` so the sidebar count decrements once the recipient actually opens that chat.
- [x] Realtime: `SocketProvider.tsx`'s `NEW_NOTIFICATION` handler bumps `getUnreadMessageCount`'s cache by 1 when the incoming notification is a `NEW_MESSAGE` (safe — it's a raw, non-deduplicated count). For `getUnreadCount` (the bell), a manual increment isn't safe since the dedup key depends on *all* of a user's unread notifications, not just the last 30 held in the `getNotifications` cache — so instead it calls `notificationAPI.util.invalidateTags(["UnreadCount"])` to force a fresh authoritative count from the server. Deliberate deviation from the original "bump" wording above.

### Verification

- [x] Two senders each message the same recipient (4 + 2) → sidebar shows `Messages(6)`; bell shows `2` (one per distinct sender).
- [x] Same sender sends more messages → sidebar count keeps climbing (raw), bell's contribution from that sender stays at `1` (already counted).
- [x] A comment + a message from two different people → bell shows `2`.
- [x] Opening the chat marks that chat's message notifications read → sidebar count drops accordingly; bell's dedup count for that sender's `NEW_MESSAGE` entry also clears once all their message notifications are read.
