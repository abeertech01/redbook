import { useGetMessagesQuery } from "@/app/api/chat"
import { RootState } from "@/app/store"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { NEW_MESSAGE } from "@/constants/events"
import { getSocket } from "@/constants/SocketProvider"
import useSocketEvents from "@/hooks/useSocketEvents"
import { timeAgo } from "@/lib/helper"
import { Message } from "@/utility/types"
import clsx from "clsx"
import React, { useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { useLocation } from "react-router-dom"

type InboxProps = {}

const Inbox: React.FC<InboxProps> = () => {
  const [text, setText] = useState<string>()
  const { user } = useSelector((state: RootState) => state.user)
  const { pathname } = useLocation()
  // const reversedMessages = messages.reverse()
  const scrollRef = useRef<HTMLUListElement>(null)
  const socket = getSocket()

  const chatId = pathname.match(/\/messages\/(.*)/)![1]

  const {
    data: messagesResult,
    isLoading,
    refetch,
  } = useGetMessagesQuery(chatId)

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

  const eventHandler = {
    // [NEW_MESSAGE]: (data: { newMessage: Message }) => {
    //   if (data.newMessage.chatId === chatId) {
    //     refetch()
    //   }
    // },]
    [NEW_MESSAGE]: (_: unknown) => {
      refetch()
    },
  }

  useSocketEvents(socket!, eventHandler)

  return (
    <div className="h-full flex flex-col gap-4">
      <Card className="h-[3.5rem] bg-secondary px-4 py-2 mx-4 flex gap-3 items-center">
        <Avatar className="w-8 h-8">
          <AvatarImage src={messagesResult?.participator.profileImgUrl} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>

        <h1 className="font-bold text-xl">
          {messagesResult?.participator.name}
        </h1>
      </Card>

      <ul
        ref={scrollRef}
        className="relative flex-1 flex flex-col justify-end gap-4 pl-5 pr-[0.6rem] overflow-y-scroll scroll-smooth scrollbar-thin scrollbar-thumb-secondary scrollbar-track-transparent"
      >
        {messagesResult &&
          messagesResult.messages.map((message: Message) => (
            <li
              className={clsx(
                "flex flex-col gap-1",
                message.authorId === user?.id ? "items-end" : "items-start"
              )}
            >
              <div className="flex items-center gap-1 text-gray-500">
                <small>
                  {messagesResult.participator.id === user?.id
                    ? user.name
                    : messagesResult.participator.name}
                </small>
                <div>•</div>
                <small>{timeAgo(message.createdAt)}</small>
              </div>
              <Card
                className={clsx(
                  "px-3 py-1",
                  message.authorId === user?.id
                    ? "bg-zinc-500 text-white"
                    : "bg-rose-600 text-white dark:text-white"
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
