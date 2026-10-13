import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router-dom"
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useLazyGetNotificationsQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from "@/app/api/notification"
import { Notification, NotificationType } from "@/utility/types"
import { cn } from "@/lib/utils"
import TimeAgo from "./TimeAgo"
import UserAvatar from "./UserAvatar"

const notificationVerb: Record<NotificationType, string> = {
  NEW_COMMENT: "commented on your post",
  POST_UPVOTE: "upvoted your post",
  POST_DOWNVOTE: "downvoted your post",
  NEW_MESSAGE: "sent you a message",
}

const badgeColor: Record<NotificationType, string> = {
  POST_UPVOTE: "#ff3358",
  POST_DOWNVOTE: "#4f8cf0",
  NEW_MESSAGE: "#3ea37a",
  NEW_COMMENT: "#a06ae8",
}

const badgeIcon: Record<NotificationType, React.ReactNode> = {
  POST_UPVOTE: <path d="M12 4l8 9h-5v7H9v-7H4z" />,
  POST_DOWNVOTE: <path d="M12 20l-8-9h5V4h6v7h5z" />,
  NEW_MESSAGE: <path d="M4 4h16v12H8l-4 4z" />,
  NEW_COMMENT: <circle cx="12" cy="12" r="7" />,
}

const notificationTarget = (notification: Notification) =>
  notification.type === "NEW_MESSAGE"
    ? `/messages/${notification.chatId}`
    : `/post/${notification.postId}`

const NotificationRow = ({ notification }: { notification: Notification }) => {
  const navigate = useNavigate()
  const [markAsRead] = useMarkAsReadMutation()

  const handleSelect = () => {
    markAsRead(notification.id)
    navigate(notificationTarget(notification))
  }

  return (
    <button
      type="button"
      onClick={handleSelect}
      className={cn(
        "flex w-full cursor-pointer items-start gap-3 rounded-[10px] p-2.5 text-left hover:bg-hover-2",
        !notification.isRead && "bg-brand/6"
      )}
    >
      <div className="relative flex-none">
        <UserAvatar user={notification.actor} className="size-9 text-[12.5px]" />
        <div
          className="absolute -right-0.75 -bottom-0.75 grid size-4.5 place-items-center rounded-full border-2 border-pop text-white"
          style={{ background: badgeColor[notification.type] }}
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
            {badgeIcon[notification.type]}
          </svg>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm leading-[1.4] text-ink-2">
          <span className="font-semibold text-ink">{notification.actor?.name}</span>{" "}
          {notificationVerb[notification.type]}
        </div>
        <div className="mt-0.5 text-xs text-mute-2">
          <TimeAgo timestamp={notification.createdAt} variant="date" />
        </div>
      </div>
      {!notification.isRead && (
        <span className="mt-1.5 size-2 flex-none rounded-full bg-brand" />
      )}
    </button>
  )
}

const LOAD_MORE_THRESHOLD = 80

type NotificationPanelProps = {
  open: boolean
  onClose: () => void
  /** Phones pin the panel to the viewport edges instead of the bell. */
  mobile: boolean
}

const NotificationPanel = ({ open, onClose, mobile }: NotificationPanelProps) => {
  const { data: unreadData } = useGetUnreadCountQuery()
  const { data: notificationsData, isLoading } = useGetNotificationsQuery(
    undefined,
    { skip: !open }
  )
  const [fetchMoreNotifications, { isFetching: isFetchingMore }] =
    useLazyGetNotificationsQuery()
  const [markAllAsRead, { isLoading: isMarkingAllAsRead }] =
    useMarkAllAsReadMutation()

  const unreadCount = unreadData?.count ?? 0
  const notifications = notificationsData?.notifications ?? []
  const hasMore = notificationsData?.hasMore ?? false
  const nextCursor = notificationsData?.nextCursor ?? null

  const listRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    const el = listRef.current
    if (!el || !hasMore || !nextCursor || isFetchingMore) return

    if (el.scrollHeight - el.scrollTop - el.clientHeight < LOAD_MORE_THRESHOLD) {
      fetchMoreNotifications(nextCursor)
    }
  }

  // On a tall screen a full page may not overflow the panel, leaving no
  // scrollbar and therefore no way to reach the rest - keep pulling pages
  // until it's actually scrollable or there's nothing left.
  useEffect(() => {
    const el = listRef.current
    if (!el || !open || !hasMore || !nextCursor || isFetchingMore) return

    if (el.scrollHeight <= el.clientHeight) {
      fetchMoreNotifications(nextCursor)
    }
  }, [
    open,
    notifications.length,
    hasMore,
    nextCursor,
    isFetchingMore,
    fetchMoreNotifications,
  ])

  if (!open) return null

  // Portalled to <body>: the header's backdrop-filter makes it the
  // containing block for fixed-position children, which would shrink the
  // click-outside overlay to the header strip and offset the panel.
  return createPortal(
    <>
      <div onClick={onClose} className="fixed inset-0 z-40" />
      <div
        role="dialog"
        aria-label="Notifications"
        className={cn(
          "z-41 max-w-[calc(100vw-16px)] overflow-hidden rounded-2xl border border-line-2 bg-pop shadow-[0_24px_60px_var(--shade)]",
          // Desktop lines up under the bell: header is 64px tall with 24px
          // side padding.
          mobile ? "fixed inset-x-2 top-18" : "fixed top-16 right-6 w-95"
        )}
      >
        <div className="flex items-center justify-between px-4.5 pt-4 pb-3">
          <div className="text-[15px] font-semibold">Notifications</div>
          <button
            type="button"
            onClick={() => markAllAsRead()}
            disabled={unreadCount === 0 || isMarkingAllAsRead}
            className="cursor-pointer py-1 text-[13px] text-accent-text disabled:cursor-default disabled:opacity-50"
          >
            Mark all as read
          </button>
        </div>
        <div
          ref={listRef}
          onScroll={handleScroll}
          className={cn(
            "thin-scroll flex flex-col gap-0.5 overflow-auto px-2 pb-2",
            mobile ? "max-h-[calc(100dvh-170px)]" : "max-h-110"
          )}
        >
          {isLoading && (
            <div className="px-2 py-4 text-center text-sm text-mute">Loading...</div>
          )}
          {!isLoading && notifications.length === 0 && (
            <div className="px-2 py-4 text-center text-sm text-mute">
              No notifications yet
            </div>
          )}
          {notifications.map((notification) => (
            <NotificationRow key={notification.id} notification={notification} />
          ))}
          {isFetchingMore && (
            <div className="px-2 py-2 text-center text-xs text-mute">
              Loading more...
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  )
}

export default NotificationPanel
