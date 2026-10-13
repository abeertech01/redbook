import {
  chatAPI,
  useGetMessagesQuery,
  useLazyGetMessagesQuery,
} from "@/app/api/chat"
import { useMarkChatNotificationsAsReadMutation } from "@/app/api/notification"
import { AppDispatch, RootState } from "@/app/store"
import { TooltipProvider } from "@/components/ui/tooltip"
import { NEW_MESSAGE } from "@/constants/events"
import { useSocket } from "@/constants/SocketProvider"
import useSocketEvents from "@/hooks/useSocketEvents"
import MessageBubble from "@/components/MessageBubble"
import UserAvatar from "@/components/UserAvatar"
import { cn } from "@/lib/utils"
import { Message } from "@/utility/types"
import { ArrowUp, ChevronLeft, Info } from "lucide-react"
import { Fragment, useCallback, useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useOutletContext, useParams } from "react-router-dom"
import { useAppShell } from "@/components/layout/AppShellContext"
import type { InboxOutletContext } from "./Messages"

const NEAR_BOTTOM_THRESHOLD = 80
const LOAD_MORE_THRESHOLD = 80

const dayKey = (timestamp: Date) => new Date(timestamp).toDateString()

// e.g. "3 Sep 2026"
const formatDay = (timestamp: Date) =>
  new Date(timestamp).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

const Inbox = () => {
  const [text, setText] = useState("")
  const { user } = useSelector((state: RootState) => state.user)
  const dispatch = useDispatch<AppDispatch>()
  const { chatId } = useParams() as { chatId: string }
  const { isMobile } = useAppShell()
  const { infoOpen, canShowInfo, toggleInfo } =
    useOutletContext<InboxOutletContext>()
  const scrollRef = useRef<HTMLUListElement>(null)
  const socket = useSocket()

  const { data: messagesResult } = useGetMessagesQuery({ chatId })
  const [fetchMoreMessages, { isFetching: isFetchingMore }] =
    useLazyGetMessagesQuery()
  const [markChatNotificationsAsRead] =
    useMarkChatNotificationsAsReadMutation()

  const participator = messagesResult?.participator

  // Whether the next messagesResult update is this chat's first page (scroll
  // to bottom), a load-more-on-scroll-up response (preserve reading
  // position), or a plain append (only follow it if already near the
  // bottom) - three cases that all fire through the same effect below.
  const isInitialLoadRef = useRef(true)
  const isNearBottomRef = useRef(true)
  const loadingOlderRef = useRef(false)
  const prevScrollHeightRef = useRef(0)
  const prevScrollTopRef = useRef(0)

  useEffect(() => {
    isInitialLoadRef.current = true
    isNearBottomRef.current = true
  }, [chatId])

  useEffect(() => {
    markChatNotificationsAsRead(chatId)
  }, [chatId, markChatNotificationsAsRead])

  const loadMore = useCallback(() => {
    const el = scrollRef.current
    if (
      !el ||
      !messagesResult?.hasMore ||
      !messagesResult.nextCursor ||
      isFetchingMore ||
      loadingOlderRef.current
    )
      return

    prevScrollHeightRef.current = el.scrollHeight
    prevScrollTopRef.current = el.scrollTop
    loadingOlderRef.current = true
    fetchMoreMessages({ chatId, cursor: messagesResult.nextCursor })
  }, [chatId, messagesResult, isFetchingMore, fetchMoreMessages])

  useEffect(() => {
    const el = scrollRef.current
    if (!el || !messagesResult) return

    if (isInitialLoadRef.current) {
      el.scrollTop = el.scrollHeight
      isInitialLoadRef.current = false
    } else if (loadingOlderRef.current) {
      el.scrollTop =
        prevScrollTopRef.current + (el.scrollHeight - prevScrollHeightRef.current)
      loadingOlderRef.current = false
    } else if (isNearBottomRef.current) {
      el.scrollTop = el.scrollHeight
    }

    // Short messages may not fill the panel even with more history
    // available - keep pulling pages until it's scrollable or exhausted.
    if (messagesResult.hasMore && el.scrollHeight <= el.clientHeight) {
      loadMore()
    }
  }, [messagesResult, loadMore])

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return

    isNearBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_THRESHOLD

    if (el.scrollTop < LOAD_MORE_THRESHOLD) {
      loadMore()
    }
  }

  const canSend = text.trim().length > 0

  const handleSendMessage = () => {
    if (!canSend) return

    socket?.emit(NEW_MESSAGE, {
      chatId,
      message: text.trim(),
    })

    setText("")
  }

  useSocketEvents(socket, {
    [NEW_MESSAGE]: (data: unknown) => {
      const newMessage = (data as { newMessage: Message }).newMessage
      if (newMessage.chatId === chatId) {
        dispatch(
          chatAPI.util.updateQueryData("getMessages", { chatId }, (draft) => {
            draft.messages.push(newMessage)
          })
        )
        markChatNotificationsAsRead(chatId)
      }
    },
  })

  const messages = messagesResult?.messages ?? []

  return (
    <>
      <div
        className={cn(
          "flex h-17 flex-none items-center gap-3 border-b border-line pr-4",
          isMobile ? "pl-1.5" : "pl-5"
        )}
      >
        {isMobile && (
          <Link
            to="/messages"
            aria-label="Back"
            className="grid size-9.5 flex-none place-items-center rounded-full text-ink hover:bg-hover-2"
          >
            <ChevronLeft size={19} />
          </Link>
        )}
        <UserAvatar user={participator} className="size-10 text-[13.5px]" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15.5px] font-semibold">{participator?.name}</div>
          {participator && (
            <div className="truncate text-[12.5px] text-mute-2">
              @{participator.username}
            </div>
          )}
        </div>
        {canShowInfo && (
          <button
            type="button"
            onClick={toggleInfo}
            aria-label="Conversation info"
            aria-pressed={infoOpen}
            className={cn(
              "grid size-9.5 cursor-pointer place-items-center rounded-full text-ink hover:bg-hover-2",
              infoOpen && "bg-hover-2"
            )}
          >
            <Info size={18} />
          </button>
        )}
      </div>

      <ul
        ref={scrollRef}
        onScroll={handleScroll}
        className="thin-scroll flex flex-1 flex-col overflow-auto px-5 pt-5 pb-3"
      >
        {isFetchingMore && (
          <li className="py-1 text-center text-xs text-faint">
            Loading older messages...
          </li>
        )}
        <TooltipProvider delayDuration={200}>
          {messages.map((message, index) => {
            const prev = messages[index - 1]
            const next = messages[index + 1]
            const newDay = !prev || dayKey(prev.createdAt) !== dayKey(message.createdAt)
            const first = newDay || prev.authorId !== message.authorId
            const last =
              !next ||
              next.authorId !== message.authorId ||
              dayKey(next.createdAt) !== dayKey(message.createdAt)

            return (
              <Fragment key={message.id}>
                {newDay && (
                  <li
                    className={cn(
                      "flex justify-center pt-1 pb-4",
                      index === 0 ? "mt-auto" : "mt-3.5"
                    )}
                  >
                    <span className="font-mono text-[11px] tracking-[0.06em] text-faint uppercase">
                      {formatDay(message.createdAt)}
                    </span>
                  </li>
                )}
                <li className={cn(!newDay && (first ? "mt-3.5" : "mt-0.75"))}>
                  <MessageBubble
                    message={message}
                    isOwn={message.authorId === user?.id}
                    first={first}
                    last={last}
                    author={participator}
                  />
                </li>
              </Fragment>
            )
          })}
        </TooltipProvider>
      </ul>

      <div className="flex flex-none items-center gap-2.5 px-4 pt-3 pb-4">
        <div className="flex h-11.5 min-w-0 flex-1 items-center rounded-full border border-line-2 bg-field pr-1.5 pl-4.5 focus-within:border-line-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            placeholder="Write a message…"
            aria-label="Write a message"
            className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none"
          />
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!canSend}
            aria-label="Send"
            className={cn(
              "grid size-9 flex-none place-items-center rounded-full",
              canSend ? "cursor-pointer bg-brand text-white" : "bg-line text-faint"
            )}
          >
            <ArrowUp size={16} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </>
  )
}
export default Inbox
