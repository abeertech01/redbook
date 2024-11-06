import { useGetChatsQuery } from "@/app/api/chat"
import Navbar from "@/components/Navbar"
import SearchUser from "@/components/SearchUser"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Outlet, useLocation } from "react-router-dom"

type MessagesProps = {}

const Messages: React.FC<MessagesProps> = () => {
  const { pathname } = useLocation()
  const { data, isLoading, refetch } = useGetChatsQuery()

  const socket = getSocket()

  const eventHandler = {
    [NEW_CHAT]: (_: string) => refetch(),
  }

  useSocketEvents(socket!, eventHandler)

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
                <ul className="w-full flex flex-col gap-4 mt-4">
                  {data &&
                    data.chats.map((chat: Chat, i: number) => (
                      <li key={i} className="w-full flex gap-2 items-center">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src="https://github.com/shadcn.png" />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div className="w-full">
                          <h3 className="font-semibold line-clamp-1">
                            {chat?.members[chat.theOtherUserIndex]?.name}{" "}
                            <small className="text-gray-400">
                              @{chat.members[chat.theOtherUserIndex]?.username}
                            </small>
                          </h3>
                          <div className="w-[12rem] flex gap-2">
                            <p className="flex-1 text-sm line-clamp-1">
                              {chat.lastMessage}
                            </p>
                            <small className="inline-block text-zinc-400">
                              {timeAgo(chat.updatedAt)}
                            </small>
                          </div>
                        </div>
                      </li>
                    ))}
                </ul>
              </ScrollArea>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={44} className="py-4 flex flex-col">
            {(pathname === "/messages" || pathname === "/messages/") && (
              <div className="w-full h-full flex justify-center items-center">
                <h1 className="text-2xl font-bold text-zinc-500">
                  Start A Conversation...
                </h1>
              </div>
            )}

            <Outlet />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={28} className="p-4">
            <div className="w-full h-full">
              <Avatar className="w-28 h-28 mx-auto my-5">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>

              <div className="flex flex-col items-center gap-4">
                <h1 className="text-2xl">John Doe</h1>
                <div className="text-center">
                  <h1 className="text-zinc-400 text-sm">Username</h1>
                  <p>@johndoe</p>
                </div>
                <div className="text-center">
                  <h1 className="text-zinc-400 text-sm">Email</h1>
                  <p>johndoe@gmail.com</p>
                </div>
                <div className="text-center w-4/5">
                  <h1 className="text-zinc-400 text-sm">Bio</h1>
                  <p>
                    Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                    Accusantium dignissimos mollitia nostrum. Ipsum, ipsam
                    quisquam assumenda illo ut, vero iure nesciunt magnam quasi
                    iste adipisci labore tempore dicta, fuga dignissimos.
                  </p>
                </div>
                <div className="text-center">
                  <h1 className="text-zinc-400 text-sm">Joined</h1>
                  <p>15th June, 2024</p>
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}

export default Messages
