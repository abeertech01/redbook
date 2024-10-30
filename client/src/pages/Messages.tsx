import Navbar from "@/components/Navbar"
import SearchUser from "@/components/SearchUser"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import React from "react"
import { Outlet, useLocation } from "react-router-dom"

type MessagesProps = {}

const Messages: React.FC<MessagesProps> = () => {
  const { pathname } = useLocation()

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
                  {Array(20)
                    .fill(null)
                    .map((_, i: number) => (
                      <li key={i} className="w-full flex gap-2 items-center">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src="https://github.com/shadcn.png" />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div className="w-full">
                          <h3 className="font-semibold">
                            John Doe{" "}
                            <small className="text-gray-400">@johndoe</small>
                          </h3>
                          <div className="w-[12rem] flex gap-2">
                            <p className="flex-1 text-sm line-clamp-1">
                              Lorem ipsum dolor sit amet, consectetur
                              adipisicing elit. Ipsam eum expedita nostrum
                              accusamus commodi laboriosam optio aliquam animi
                              delectus ipsa.
                            </p>
                            <small className="inline-block text-zinc-400">
                              2hr ago
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
