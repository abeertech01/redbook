import { useGetChatsQuery } from "@/app/api/chat"
import { useLazySearchUsersQuery } from "@/app/api/user"
import ChatParticipator from "@/components/ChatParticipator"
import { useAppShell } from "@/components/layout/AppShellContext"
import TimeAgo from "@/components/TimeAgo"
import UserAvatar from "@/components/UserAvatar"
import { NEW_CHAT } from "@/constants/events"
import { useSocket } from "@/constants/SocketProvider"
import useSocketEvents from "@/hooks/useSocketEvents"
import useStartChat from "@/hooks/useStartChat"
import { cn } from "@/lib/utils"
import { Chat } from "@/utility/types"
import { useDebounce, useMediaQuery } from "@uidotdev/usehooks"
import { MessageSquare, Search } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, Outlet, useNavigate, useParams } from "react-router-dom"

export type InboxOutletContext = {
  infoOpen: boolean
  /** Whether the screen is wide enough for the info panel at all. */
  canShowInfo: boolean
  toggleInfo: () => void
}

const ListMessage = ({ children }: { children: React.ReactNode }) => (
  <div className="px-3 py-6 text-center text-sm text-mute">{children}</div>
)

const Messages = () => {
  const navigate = useNavigate()
  const { chatId } = useParams()
  const socket = useSocket()
  const startChat = useStartChat()
  const { isMobile, showBottomNav } = useAppShell()
  const canShowInfo = useMediaQuery("(min-width: 1180px)")
  const [infoOpen, setInfoOpen] = useState(true)

  const { data, refetch } = useGetChatsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })
  const chats = data?.chats ?? []

  // The search box looks up any user (not just existing conversations), so
  // it doubles as the way to start a new chat.
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query.trim(), 500)
  const [triggerSearch, { data: searchData, isFetching: isSearching }] =
    useLazySearchUsersQuery()
  const searching = query.trim().length > 0
  const results = debouncedQuery ? (searchData?.users ?? []) : []

  useEffect(() => {
    if (debouncedQuery) triggerSearch(debouncedQuery)
  }, [debouncedQuery, triggerSearch])

  useSocketEvents(socket, {
    [NEW_CHAT]: (chat: unknown) => {
      refetch()
      navigate(`/messages/${(chat as Chat).id}`)
    },
  })

  const selectUser = (participantId: string) => {
    setQuery("")
    startChat(participantId)
  }

  const showList = !isMobile || !chatId
  const showChat = !isMobile || !!chatId
  const showInfo = !!chatId && canShowInfo && infoOpen

  const height = isMobile
    ? showBottomNav
      ? "calc(100dvh - 164px)"
      : "calc(100dvh - 80px)"
    : showBottomNav
      ? "calc(100dvh - 176px)"
      : "calc(100dvh - 112px)"

  return (
    <div
      style={{ height }}
      className={cn(
        "flex overflow-hidden rounded-[20px] border border-line bg-surface",
        !isMobile && "min-h-120"
      )}
    >
      {showList && (
        <div
          className={cn(
            "flex min-w-0 flex-col",
            isMobile ? "w-full flex-1" : "w-75 flex-none border-r border-line"
          )}
        >
          <div className="flex flex-col gap-3 px-4 pt-4.5 pb-3">
            <div className="px-1 text-xl font-bold tracking-[-0.02em]">Messages</div>
            <label className="flex h-9.5 items-center gap-2.5 rounded-full border border-line-2 bg-field px-3 text-mute-2 focus-within:border-line-3">
              <Search size={15} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && setQuery("")}
                placeholder="Search people"
                aria-label="Search people"
                className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none"
              />
            </label>
          </div>
          <div className="thin-scroll flex flex-1 flex-col gap-0.5 overflow-auto px-2 pb-2">
            {searching ? (
              <>
                {(isSearching || query.trim() !== debouncedQuery) && (
                  <ListMessage>Searching…</ListMessage>
                )}
                {!isSearching &&
                  query.trim() === debouncedQuery &&
                  results.length === 0 && <ListMessage>No matches found</ListMessage>}
                {!isSearching &&
                  results.map((person) => (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => selectUser(person.id)}
                      className="flex cursor-pointer items-center gap-3 rounded-[14px] p-2.5 text-left hover:bg-chip"
                    >
                      <UserAvatar user={person} className="size-11 text-sm" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[14.5px] font-semibold">
                          {person.name}
                        </div>
                        <div className="truncate text-[13.5px] text-mute">
                          @{person.username}
                        </div>
                      </div>
                    </button>
                  ))}
              </>
            ) : (
              <>
                {data && chats.length === 0 && (
                  <ListMessage>
                    No conversations yet. Search for someone to start one.
                  </ListMessage>
                )}
                {chats.map((chat) => {
                  const other = chat.members[chat.theOtherUserIndex]
                  return (
                    <Link
                      key={chat.id}
                      to={`/messages/${chat.id}`}
                      className={cn(
                        "flex items-center gap-3 rounded-[14px] p-2.5 text-ink hover:bg-chip",
                        chat.id === chatId && "bg-hover-2 hover:bg-hover-2"
                      )}
                    >
                      <UserAvatar user={other} className="size-11 text-sm" />
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <div className="flex items-baseline gap-2">
                          <span className="min-w-0 flex-1 truncate text-[14.5px] font-semibold">
                            {other?.name}
                          </span>
                          <span className="flex-none text-xs text-mute-2">
                            <TimeAgo timestamp={chat.updatedAt} />
                          </span>
                        </div>
                        <span className="truncate text-[13.5px] text-mute">
                          {chat.lastMessage || "Say hi"}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </>
            )}
          </div>
        </div>
      )}

      {showChat && (
        <div className="flex min-w-0 flex-1 flex-col">
          {chatId ? (
            <Outlet
              context={
                {
                  infoOpen,
                  canShowInfo,
                  toggleInfo: () => setInfoOpen((open) => !open),
                } satisfies InboxOutletContext
              }
            />
          ) : (
            <div className="grid flex-1 place-items-center p-6 text-center">
              <div className="flex flex-col items-center gap-3 text-mute">
                <div className="grid size-14 place-items-center rounded-full bg-chip text-ink-3b">
                  <MessageSquare size={24} />
                </div>
                <div className="text-[15px] font-semibold text-ink">Your messages</div>
                <div className="text-sm">
                  Pick a conversation, or search for someone to start one.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showInfo && <ChatParticipator chatId={chatId} />}
    </div>
  )
}

export default Messages
