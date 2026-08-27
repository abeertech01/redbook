import { useGet10RandomUsersQuery } from "@/app/api/user"
import { RootState } from "@/app/store"
import AllPosts from "@/components/AllPosts"
import Navbar from "@/components/Navbar"
import PostCreate from "@/components/PostCreate"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NEW_CHAT } from "@/constants/events"
import { useSocket } from "@/constants/SocketProvider"
import React, { createContext, useState } from "react"
import { useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"

type PgntPostsType = {
  arePaginatedPosts: boolean
  setArePaginatedPosts: React.Dispatch<React.SetStateAction<boolean>>
}

export const PgntPostsContext = createContext<PgntPostsType>({
  arePaginatedPosts: false,
  setArePaginatedPosts: (prev) => prev,
})

const Home: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.user)
  const { data: _10Users } = useGet10RandomUsersQuery()
  const socket = useSocket()
  const [arePaginatedPosts, setArePaginatedPosts] = useState(false)

  const startChatting = (participantId: string) => {
    socket?.emit(NEW_CHAT, {
      participantId,
    })

    navigate("/messages")
  }

  return (
    <div>
      <Navbar />
      {/* 768 = 14rem + 20rem + 14rem = 48 */}

      <div className="md:grid md:grid-cols-[minmax(13rem,22rem)_minmax(22rem,auto)_minmax(13rem,22rem)]">
        <ScrollArea className="p-2 h-[calc(100vh-3.5rem)]">
          <div className="flex flex-col items-start gap-2 bg-secondary shadow-md p-4 rounded-md min-h-full">
            <Link to={"/profile"} className="text-md hover:underline">
              Profile
            </Link>

            <Link to={"/messages"} className="text-md hover:underline">
              Messages
            </Link>

            <Link
              to={"#"}
              className="text-md text-zinc-500 hover:underline cursor-not-allowed"
            >
              Marketplace
            </Link>
          </div>
        </ScrollArea>

        <div className="min-h-[calc(100vh-3.5rem)]">
          <div className="flex flex-col gap-4 mx-auto md:px-2 lg:px-0 py-4 lg:w-9/12 h-full md:full">
            <PgntPostsContext.Provider
              value={{
                arePaginatedPosts,
                setArePaginatedPosts,
              }}
            >
              <PostCreate />
            </PgntPostsContext.Provider>
            <div className="relative h-[calc(100vh-9.25rem)]">
              <PgntPostsContext.Provider
                value={{
                  arePaginatedPosts,
                  setArePaginatedPosts,
                }}
              >
                <AllPosts userId={user!.id} />
              </PgntPostsContext.Provider>
            </div>
          </div>
        </div>

        <ScrollArea className="p-2 h-[calc(100vh-3.5rem)]">
          <div className="bg-secondary shadow-md px-6 py-4 rounded-md min-h-full">
            <h1 className="mb-4 text-center underline">
              People You may want to chat with
            </h1>
            <ul className="flex flex-col">
              {_10Users?.users.map((person, i: number) => (
                <li key={i} className="">
                  <Button
                    onClick={() => startChatting(person.id)}
                    className="flex justify-start gap-2 bg-inherit hover:bg-background px-4 py-3 w-full h-full text-primary"
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage
                        src={person.profileImgUrl}
                        className="object-cover"
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <h1 className="font-semibold text-lg">{person.name}</h1>
                      <p className="text-muted-foreground text-sm">
                        @{person.username}
                      </p>
                    </div>
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
export default Home
