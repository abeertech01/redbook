import { Link } from "react-router-dom"
import { useGetUnreadMessageCountQuery } from "@/app/api/notification"

const MessagesSidebarLink = () => {
  const { data } = useGetUnreadMessageCountQuery()
  const unreadMessageCount = data?.count ?? 0

  return (
    <Link to={"/messages"} className="text-md hover:underline">
      Messages{unreadMessageCount > 0 && ` (${unreadMessageCount})`}
    </Link>
  )
}

export default MessagesSidebarLink
