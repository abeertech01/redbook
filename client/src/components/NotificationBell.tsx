import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Bell } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from "@/app/api/notification"
import { Notification, NotificationType } from "@/utility/types"
import { cn } from "@/lib/utils"
import TimeAgo from "./TimeAgo"

const notificationVerb: Record<NotificationType, string> = {
  NEW_COMMENT: "commented on your post",
  POST_UPVOTE: "upvoted your post",
  POST_DOWNVOTE: "downvoted your post",
  NEW_MESSAGE: "sent you a message",
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
    <DropdownMenuItem
      onSelect={handleSelect}
      className={cn(
        "flex items-start gap-2 py-2 cursor-pointer",
        !notification.isRead && "bg-accent/60"
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage
          src={notification.actor?.profileImgUrl}
          className="object-cover"
        />
        <AvatarFallback>{notification.actor?.name?.[0]}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-0.5">
        <p className="text-sm leading-snug whitespace-normal">
          <span className="font-semibold">{notification.actor?.name}</span>{" "}
          {notificationVerb[notification.type]}
        </p>
        <span className="text-xs text-muted-foreground">
          <TimeAgo timestamp={notification.createdAt} variant="date" />
        </span>
      </div>
    </DropdownMenuItem>
  )
}

const NotificationBell = () => {
  const [open, setOpen] = useState(false)
  const { data: unreadData } = useGetUnreadCountQuery()
  const { data: notificationsData, isLoading } = useGetNotificationsQuery(
    undefined,
    { skip: !open }
  )
  const [markAllAsRead, { isLoading: isMarkingAllAsRead }] =
    useMarkAllAsReadMutation()

  const unreadCount = unreadData?.count ?? 0
  const notifications = notificationsData?.notifications ?? []

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="relative bg-zinc-800 hover:bg-zinc-800 focus-visible:outline-none text-white hover:text-inherit"
        >
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1 text-xs"
            disabled={unreadCount === 0 || isMarkingAllAsRead}
            onClick={(e) => {
              e.stopPropagation()
              markAllAsRead()
            }}
          >
            Mark all as read
          </Button>
        </div>
        <DropdownMenuSeparator />
        {isLoading && (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        )}
        {!isLoading && notifications.length === 0 && (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        )}
        {notifications.map((notification) => (
          <NotificationRow key={notification.id} notification={notification} />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default NotificationBell
