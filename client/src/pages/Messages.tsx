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
import { useSocket } from "@/constants/SocketProvider"
import useSocketEvents from "@/hooks/useSocketEvents"
import { timeAgo } from "@/lib/helper"
import { Chat } from "@/utility/types"
import { useEffect } from "react"

import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom"

const Messages = () => {
  const navigate = useNavigate()
  const { chatId } = useParams()
  const { pathname } = useLocation()
  const { data, refetch } = useGetChatsQuery()

  const socket = useSocket()

  const eventHandler = {
    [NEW_CHAT]: (chat: unknown) => {
      refetch()
      navigate(`/messages/${(chat as Chat).id}`)
    },
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
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel defaultSize="28%">
            <div className="py-2 pr-2 pl-3">
              <SearchUser />
              <h1 className="mt-2 font-semibold text-2xl">Messages</h1>

              <ScrollArea className="w-full h-[calc(100vh-9rem)]">
                <ul className="flex flex-col mt-4 w-full">
                  {data &&
                    data.chats.map((chat: Chat, i: number) => (
                      <li key={i} className="w-full">
                        <Button
                          onClick={() => startChatting(chat)}
                          className="flex justify-start items-center gap-2 bg-background hover:bg-primary-foreground px-3 py-3 w-full h-full text-primary"
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
                            <h3 className="font-semibold text-left line-clamp-1">
                              {chat?.members[chat.theOtherUserIndex]?.name}{" "}
                              <small className="text-gray-400">
                                @
                                {chat.members[chat.theOtherUserIndex]?.username}
                              </small>
                            </h3>
                            <div className="flex gap-2 min-w-44 max-w-max">
                              <p className="flex-1 text-sm text-left line-clamp-1">
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
              pathname === "/messages" || pathname === "/messages/"
                ? "72%"
                : "44%"
            }
            className="flex flex-col py-4 h-full"
          >
            {(pathname === "/messages" || pathname === "/messages/") && (
              <div className="flex justify-center items-center w-full h-full">
                <h1 className="font-bold text-zinc-500 text-2xl">
                  Start A Conversation...
                </h1>
              </div>
            )}

            <Outlet />
          </ResizablePanel>
          {chatId && (
            <>
              <ResizableHandle />
              <ResizablePanel defaultSize="28%" className="p-4">
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
