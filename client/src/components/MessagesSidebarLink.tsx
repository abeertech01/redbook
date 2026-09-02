import { Link } from "react-router-dom"
import { MessageSquare } from "lucide-react"
import { useGetUnreadMessageCountQuery } from "@/app/api/notification"

const MessagesSidebarLink = () => {
  const { data } = useGetUnreadMessageCountQuery()
  const unreadMessageCount = data?.count ?? 0

  return (
    <Link
      to={"/messages"}
      aria-label={
        unreadMessageCount > 0
          ? `Messages (${unreadMessageCount} unread)`
          : "Messages"
      }
      className="flex items-center gap-2 text-md hover:underline"
    >
      <span className="relative">
        <MessageSquare className="w-5 h-5 shrink-0" />
        {unreadMessageCount > 0 && (
          <span className="md:hidden -top-1.5 -right-1.5 absolute flex justify-center items-center bg-destructive rounded-full w-3.5 h-3.5 text-[9px] text-destructive-foreground">
            {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
          </span>
        )}
      </span>
      <span className="hidden md:inline">
        Messages{unreadMessageCount > 0 && ` (${unreadMessageCount})`}
      </span>
    </Link>
  )
}

export default MessagesSidebarLink
