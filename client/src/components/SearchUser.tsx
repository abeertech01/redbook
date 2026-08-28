import React, { useEffect, useState } from "react"
import { Input } from "./ui/input"
import { useDebounce } from "@uidotdev/usehooks"
import { useLazySearchUsersQuery } from "@/app/api/user"
import { Button } from "./ui/button"
import { useSocket } from "@/constants/SocketProvider"
import { NEW_CHAT } from "@/constants/events"

const SearchUser = () => {
  const [query, setQuery] = useState("")
  const deferredQuery = useDebounce(query, 500)
  const [triggerSearch, { data, isFetching, isUninitialized }] =
    useLazySearchUsersQuery()
  const filteredProfiles = data?.users ?? []
  const socket = useSocket()

  // Handle input change and filter profiles based on input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  const dismissSearchedList = () => {
    setQuery("")
  }

  const createChat = (participantId: string) => {
    socket?.emit(NEW_CHAT, {
      participantId,
    })
  }

  useEffect(() => {
    if (deferredQuery) triggerSearch(deferredQuery)
  }, [deferredQuery, triggerSearch])

  return (
    <div className="z-30 relative w-4/5">
      <Input
        type="text"
        placeholder="Search user..."
        value={query}
        onChange={handleInputChange}
        onBlur={dismissSearchedList}
        className="focus-visible:ring-0 w-full"
      />
      {!isFetching && deferredQuery && filteredProfiles.length > 0 && (
        <ul className="absolute bg-secondary shadow-lg mt-2 border border-destructive rounded w-full max-h-[70vh] overflow-y-auto scrollbar scrollbar-thumb-destructive scrollbar-track-transparent">
          {filteredProfiles.map((profile) => (
            <li key={profile.id}>
              <Button
                onClick={() => !isFetching && createChat(profile.id)}
                className="flex flex-col items-start bg-inherit hover:bg-card px-4 py-2 w-full h-auto overflow-hidden text-primary text-base"
              >
                <h1 className="overflow-hidden text-ellipsis leading-snug">
                  {profile.name}
                </h1>
                <small className="overflow-hidden text-zinc-500 text-ellipsis leading-snug">
                  @{profile.username}
                </small>
              </Button>
            </li>
          ))}
        </ul>
      )}

      {!isUninitialized &&
        !isFetching &&
        deferredQuery?.length > 0 &&
        filteredProfiles.length === 0 && (
          <div className="absolute bg-white shadow-lg mt-2 px-4 py-2 border border-gray-300 rounded w-full text-gray-500">
            No matches found
          </div>
        )}
    </div>
  )
}
export default SearchUser
