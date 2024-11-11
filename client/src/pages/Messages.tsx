import { useGetChatsQuery } from "@/app/api/chat"
import ChatParticipator from "@/components/ChatParticipator"
import Navbar from "@/components/Navbar"
import SearchUser from "@/components/SearchUser"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NEW_CHAT } from "@/constants/events"
import { getSocket } from "@/constants/SocketProvider"
import useSocketEvents from "@/hooks/useSocketEvents"
import { timeAgo } from "@/lib/helper"
import { Chat } from "@/utility/types"
import React, { useEffect } from "react"

import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom"

type MessagesProps = {}

const Messages: React.FC<MessagesProps> = () => {
  const navigate = useNavigate()
  const { chatId } = useParams()
  const { pathname } = useLocation()
  const { data, isLoading: _, refetch } = useGetChatsQuery()

  const socket = getSocket()

  const eventHandler = {
    [NEW_CHAT]: (_: string) => refetch(),
  }

  useSocketEvents(socket!, eventHandler)

  const startChatting = (chat: Chat) => {
    if (chatId && chatId === chat.id) return

    navigate(`/messages/${chat.id}`)
  }

  useEffect(() => {
    refetch()
  }, [])

  return (
    <div>
      <Navbar />
      <div className="h-[calc(100vh-3.5rem)]">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={28}>
            <div className="py-2 pl-3 pr-2">
              <SearchUser />
              <h1 className="text-2xl font-semibold mt-2">Messages</h1>

              <ScrollArea className="w-full h-[calc(100vh-9rem)]">
                <ul className="w-full flex flex-col mt-4">
                  {data &&
                    data.chats.map((chat: Chat, i: number) => (
                      <li key={i} className="w-full">
                        <Button
                          onClick={() => startChatting(chat)}
                          className="w-full h-full px-3 py-3 flex gap-2 items-center justify-start bg-background hover:bg-primary-foreground text-primary"
                        >
                          <Avatar className="w-12 h-12">
                            <AvatarImage
                              src={
                                chat?.members[chat.theOtherUserIndex]
                                  ?.profileImgUrl
                              }
                              className="object-cover"
                            />
                            <AvatarFallback>CN</AvatarFallback>
                          </Avatar>
                          <div className="w-full">
                            <h3 className="font-semibold line-clamp-1 text-left">
                              {chat?.members[chat.theOtherUserIndex]?.name}{" "}
                              <small className="text-gray-400">
                                @
                                {chat.members[chat.theOtherUserIndex]?.username}
                              </small>
                            </h3>
                            <div className="min-w-[11rem] max-w-max flex gap-2">
                              <p className="flex-1 text-sm line-clamp-1 text-left">
                                {chat.lastMessage}
                              </p>
                              <small className="inline-block text-zinc-400">
                                {timeAgo(chat.updatedAt)}
                              </small>
                            </div>
                          </div>
                        </Button>
                      </li>
                    ))}
                </ul>
              </ScrollArea>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel
            defaultSize={
              pathname === "/messages" || pathname === "/messages/" ? 72 : 44
            }
            className="h-full py-4 flex flex-col"
          >
            {(pathname === "/messages" || pathname === "/messages/") && (
              <div className="w-full h-full flex justify-center items-center">
                <h1 className="text-2xl font-bold text-zinc-500">
                  Start A Conversation...
                </h1>
              </div>
            )}

            <Outlet />
          </ResizablePanel>
          {chatId && (
            <>
              <ResizableHandle />
              <ResizablePanel defaultSize={28} className="p-4">
                <ChatParticipator chatId={chatId} />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  )
}

export default Messages
