import { useGetMessagesQuery } from "@/app/api/chat"
import { useMarkChatNotificationsAsReadMutation } from "@/app/api/notification"
import { RootState } from "@/app/store"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { NEW_MESSAGE } from "@/constants/events"
import { useSocket } from "@/constants/SocketProvider"
import useSocketEvents from "@/hooks/useSocketEvents"
import TimeAgo from "@/components/TimeAgo"
import { Message } from "@/utility/types"
import clsx from "clsx"
import { useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { useLocation } from "react-router-dom"

const Inbox = () => {
  const [text, setText] = useState("")
  const { user } = useSelector((state: RootState) => state.user)
  const { pathname } = useLocation()
  // const reversedMessages = messages.reverse()
  const scrollRef = useRef<HTMLUListElement>(null)
  const socket = useSocket()

  const chatId = pathname.match(/\/messages\/(.*)/)![1]

  const {
    data: messagesResult,
    isLoading,
    refetch,
  } = useGetMessagesQuery(chatId)
  const [markChatNotificationsAsRead] = useMarkChatNotificationsAsReadMutation()

  const handleSendMessage = () => {
    if (!text) return

    socket?.emit(NEW_MESSAGE, {
      chatId,
      message: text,
    })

    setText("")
  }

  useEffect(() => {
    refetch()

    if (!isLoading && messagesResult && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messagesResult])

  useEffect(() => {
    markChatNotificationsAsRead(chatId)
  }, [chatId])

  const eventHandler = {
    [NEW_MESSAGE]: (data: unknown) => {
      const newMessage = (data as { newMessage: Message }).newMessage
      if (newMessage.chatId === chatId) {
        refetch()
        markChatNotificationsAsRead(chatId)
      }
    },
  }

  useSocketEvents(socket!, eventHandler)

  return (
    <div className="flex flex-col gap-4 h-full">
      <Card className="flex items-center gap-3 bg-secondary mx-4 px-4 py-2 h-14">
        <Avatar className="w-8 h-8">
          <AvatarImage
            src={messagesResult?.participator.profileImgUrl}
            className="object-cover"
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>

        <h1 className="font-bold text-xl">
          {messagesResult?.participator.name}
        </h1>
      </Card>

      <ul
        ref={scrollRef}
        className="relative flex flex-col flex-1 justify-end gap-4 mx-auto pr-1 border-[#f4c13f] border-t-2 w-[calc(100%-2rem)] overflow-y-scroll scroll-smooth inbox-messages"
      >
        {messagesResult &&
          messagesResult.messages.map((message: Message) => (
            <li
              key={message.id}
              className={clsx(
                "flex flex-col gap-1",
                message.authorId === user?.id ? "items-end" : "items-start",
              )}
            >
              <div className="flex items-center gap-1 text-gray-500">
                <small>
                  {message.authorId === user?.id
                    ? user?.name
                    : messagesResult.participator.name}
                </small>
                <div>•</div>
                <small>
                  <TimeAgo timestamp={message.createdAt} />
                </small>
              </div>
              <Card
                className={clsx(
                  "px-3 py-1",
                  message.authorId === user?.id
                    ? "bg-zinc-500 text-white"
                    : "bg-rose-600 text-white dark:text-white",
                )}
              >
                {message.text}
              </Card>
            </li>
          ))}
      </ul>

      <div className="flex items-center gap-2 mx-4">
        <Input
          onChange={(e) => setText(e.target.value)}
          onKeyUp={(e) => e.key === "Enter" && handleSendMessage()}
          value={text}
          type="email"
          placeholder="Write Message"
        />
        <Button onClick={handleSendMessage}>Send</Button>
      </div>
    </div>
  )
}
export default Inbox
