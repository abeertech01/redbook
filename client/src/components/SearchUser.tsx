import React, { useEffect, useState } from "react"
import { Input } from "./ui/input"
import { useDebounce } from "@uidotdev/usehooks"
import { useLazySearchUsersQuery } from "@/app/api/user"
import { User } from "@/utility/types"
import { Button } from "./ui/button"
import { getSocket } from "@/constants/SocketProvider"
import { NEW_CHAT } from "@/constants/events"

type SearchUserProps = {}

const SearchUser: React.FC<SearchUserProps> = () => {
  const [postsSettlingToken, setPostsSettlingToken] = useState("")
  const [query, setQuery] = useState("")
  const deferredQuery = useDebounce(query, 500)
  const [triggerSearch, { isLoading }] = useLazySearchUsersQuery()
  const [filteredProfiles, setFilteredProfiles] = useState<User[] | []>([])
  const socket = getSocket()

  // Handle input change and filter profiles based on input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  const searchFn = async () => {
    setPostsSettlingToken("settling")

    const fetchedResult = await triggerSearch(deferredQuery)
    setFilteredProfiles(fetchedResult.data?.users as User[])

    setPostsSettlingToken("settled")
  }

  const dismissSearchedList = () => {
    setQuery("")

    if (deferredQuery.length === 0) setFilteredProfiles([])
  }

  const createChat = (participantId: string) => {
    socket?.emit(NEW_CHAT, {
      participantId,
    })
  }

  useEffect(() => {
    if (deferredQuery) {
      searchFn()
    } else {
      setFilteredProfiles([])
    }
  }, [deferredQuery])

  return (
    <div className="relative z-30 w-4/5">
      <Input
        type="text"
        placeholder="Search user..."
        value={query}
        onChange={handleInputChange}
        onBlur={dismissSearchedList}
        className="w-full focus-visible:ring-0"
      />
      {!isLoading && deferredQuery && filteredProfiles?.length > 0 && (
        <ul className="absolute w-full mt-2 bg-secondary rounded shadow-lg max-h-[70vh] overflow-y-auto scrollbar scrollbar-thumb-destructive scrollbar-track-transparent border border-destructive">
          {filteredProfiles.map((profile) => (
            <li key={profile.id}>
              <Button
                onClick={() => !isLoading && createChat(profile.id)}
                className="w-full h-auto px-4 py-2 hover:bg-card flex flex-col items-start bg-inherit text-primary text-base overflow-hidden"
              >
                <h1 className="leading-snug overflow-hidden text-ellipsis">
                  {profile.name}
                </h1>
                <small className="leading-snug text-zinc-500 overflow-hidden text-ellipsis">
                  @{profile.username}
                </small>
              </Button>
            </li>
          ))}
        </ul>
      )}

      {postsSettlingToken === "settled" &&
        deferredQuery?.length > 0 &&
        filteredProfiles?.length === 0 && (
          <div className="absolute w-full mt-2 bg-white border border-gray-300 rounded shadow-lg px-4 py-2 text-gray-500">
            No matches found
          </div>
        )}
    </div>
  )
}
export default SearchUser
