import { useGet10RandomUsersQuery } from "@/app/api/user"
import { RootState } from "@/app/store"
import AllPosts from "@/components/AllPosts"
import MessagesSidebarLink from "@/components/MessagesSidebarLink"
import Navbar from "@/components/Navbar"
import PostCreate from "@/components/PostCreate"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NEW_CHAT } from "@/constants/events"
import { useSocket } from "@/constants/SocketProvider"
import { User as UserType } from "@/utility/types"
import { Newspaper, Store, User, Users } from "lucide-react"
import React, { createContext, useState } from "react"
import { useMediaQuery } from "@uidotdev/usehooks"
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

type PeopleListProps = {
  users: UserType[]
  onSelect: (participantId: string) => void
}

const PeopleList = ({ users, onSelect }: PeopleListProps) => (
  <>
    <h1 className="mb-4 text-center underline">
      People You may want to chat with
    </h1>
    <ul className="flex flex-col">
      {users.map((person, i: number) => (
        <li key={i} className="">
          <Button
            onClick={() => onSelect(person.id)}
            className="flex justify-start gap-2 bg-inherit hover:bg-background px-4 py-3 w-full h-full text-primary"
          >
            <Avatar className="w-12 h-12 shrink-0">
              <AvatarImage src={person.profileImgUrl} className="object-cover" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start min-w-0 flex-1">
              <h1 className="font-semibold text-lg truncate w-full text-left">
                {person.name}
              </h1>
              <p className="text-muted-foreground text-sm truncate w-full text-left">
                @{person.username}
              </p>
            </div>
          </Button>
        </li>
      ))}
    </ul>
  </>
)

const Home = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.user)
  const { data: _10Users } = useGet10RandomUsersQuery()
  const socket = useSocket()
  const [arePaginatedPosts, setArePaginatedPosts] = useState(false)
  const [showPeople, setShowPeople] = useState(false)
  // Desktop keeps People in its own right-hand column, so the toggle and the
  // main-pane swap are mobile-only. Rendering that column conditionally
  // (rather than hiding it with `md:` classes) is what keeps it from
  // stacking to the bottom of the page on mobile, where the grid collapses.
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const showPeopleInMain = !isDesktop && showPeople
  const people = _10Users?.users ?? []

  const startChatting = (participantId: string) => {
    socket?.emit(NEW_CHAT, {
      participantId,
    })

    navigate("/messages")
  }

  return (
    <div>
      <Navbar />

      {/* md:px-3 pairs with each column's own p-2 for a 20px gutter, so the
          side panels line up with the navbar's px-5 instead of sitting
          ~12px closer to the screen edge than everything else. */}
      <div className="md:grid md:px-3 md:grid-cols-[minmax(13rem,22rem)_minmax(22rem,auto)_minmax(13rem,22rem)]">
        <ScrollArea className="p-2 h-auto md:h-[calc(100vh-3.5rem)]">
          <div className="flex flex-row flex-wrap items-center justify-between gap-3 md:flex-col md:flex-nowrap md:items-start md:justify-start md:gap-2 bg-secondary shadow-md p-4 rounded-md min-h-full">
            <Link
              to={"/profile"}
              aria-label="Profile"
              className="flex items-center gap-2 text-md hover:underline"
            >
              <User className="w-5 h-5 shrink-0" />
              <span className="hidden md:inline">Profile</span>
            </Link>

            <MessagesSidebarLink />

            <Link
              to={"#"}
              aria-label="Marketplace"
              className="flex items-center gap-2 text-md text-zinc-500 hover:underline cursor-not-allowed"
            >
              <Store className="w-5 h-5 shrink-0" />
              <span className="hidden md:inline">Marketplace</span>
            </Link>

            {!isDesktop && (
              <button
                type="button"
                onClick={() => setShowPeople((prev) => !prev)}
                aria-label={
                  showPeople
                    ? "Show feed"
                    : "Show people you may want to chat with"
                }
                className="flex items-center gap-2 text-md hover:underline"
              >
                {showPeople ? (
                  <Newspaper className="w-5 h-5 shrink-0" />
                ) : (
                  <Users className="w-5 h-5 shrink-0" />
                )}
              </button>
            )}
          </div>
        </ScrollArea>

        <div className="min-h-[calc(100vh-3.5rem)]">
          <div className="flex flex-col gap-4 mx-auto md:px-2 lg:px-0 py-4 lg:w-9/12 h-full md:full">
            {showPeopleInMain ? (
              <div className="flex flex-col flex-1 bg-secondary shadow-md px-6 py-4 rounded-md overflow-y-auto">
                <PeopleList users={people} onSelect={startChatting} />
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>

        {isDesktop && (
          // Deliberately a plain scroll container rather than `ScrollArea`:
          // Radix wraps its children in a `display: table; min-width: 100%`
          // element that grows to the content's max-content width, and
          // Button's base sets `whitespace-nowrap`, so a long username
          // stretched the card ~20px past the column and ate its right
          // padding. This keeps the card's width tied to the column, so its
          // right gap matches the left sidebar's - same approach the mobile
          // People pane already uses.
          <div className="p-2 h-[calc(100vh-3.5rem)]">
            <div className="people-scroll bg-secondary shadow-md px-6 py-4 rounded-md h-full overflow-y-auto">
              <PeopleList users={people} onSelect={startChatting} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default Home
