import { useGetChatsQuery } from "@/app/api/chat"
import { NEW_CHAT } from "@/constants/events"
import { useSocket } from "@/constants/SocketProvider"
import { useNavigate } from "react-router-dom"

// Opens the conversation with a user, creating it first if there isn't one
// yet. Going straight to an existing chat avoids the server's "chat already
// exists" CHAT_ERROR for someone you've already talked to.
const useStartChat = () => {
  const navigate = useNavigate()
  const socket = useSocket()
  const { data } = useGetChatsQuery()

  return (participantId: string) => {
    const existing = data?.chats.find(
      (chat) => chat.members[chat.theOtherUserIndex]?.id === participantId
    )

    if (existing) {
      navigate(`/messages/${existing.id}`)
      return
    }

    // Messages' NEW_CHAT listener navigates into the new chat once the
    // server confirms it.
    socket?.emit(NEW_CHAT, { participantId })
    navigate("/messages")
  }
}

export default useStartChat
