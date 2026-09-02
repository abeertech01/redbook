import {
  chatAPI,
  useGetMessagesQuery,
  useLazyGetMessagesQuery,
} from "@/app/api/chat"
import { useMarkChatNotificationsAsReadMutation } from "@/app/api/notification"
import { AppDispatch, RootState } from "@/app/store"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { TooltipProvider } from "@/components/ui/tooltip"
import { NEW_MESSAGE } from "@/constants/events"
import { useSocket } from "@/constants/SocketProvider"
import useSocketEvents from "@/hooks/useSocketEvents"
import MessageBubble from "@/components/MessageBubble"
import { Message } from "@/utility/types"
import { ArrowLeft } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useLocation } from "react-router-dom"

const NEAR_BOTTOM_THRESHOLD = 80
const LOAD_MORE_THRESHOLD = 80

const Inbox = () => {
  const [text, setText] = useState("")
  const { user } = useSelector((state: RootState) => state.user)
  const dispatch = useDispatch<AppDispatch>()
  const { pathname } = useLocation()
  const scrollRef = useRef<HTMLUListElement>(null)
  const socket = useSocket()

  const chatId = pathname.match(/\/messages\/(.*)/)![1]

  const { data: messagesResult } = useGetMessagesQuery({ chatId })
  const [fetchMoreMessages, { isFetching: isFetchingMore }] =
    useLazyGetMessagesQuery()
  const [markChatNotificationsAsRead] =
    useMarkChatNotificationsAsReadMutation()

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

  const handleSendMessage = () => {
    if (!text) return

    socket?.emit(NEW_MESSAGE, {
      chatId,
      message: text,
    })

    setText("")
  }

  const eventHandler = {
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
  }

  useSocketEvents(socket!, eventHandler)

  return (
    <div className="flex flex-col gap-4 h-full">
      <Card className="flex items-center gap-3 bg-secondary mx-4 px-4 py-2 h-14">
        <Link to="/messages" className="md:hidden">
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <Avatar className="w-8 h-8">
          <AvatarImage
            src={messagesResult?.participator.profileImgUrl}
            className="object-cover"
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>

        <h1 className="font-bold text-xl">
          {messagesResult?.participator.name}
        </h1>
      </Card>

      <ul
        ref={scrollRef}
        onScroll={handleScroll}
        className="relative flex flex-col flex-1 gap-4 mx-auto pr-1 border-[#f4c13f] border-t-2 w-[calc(100%-2rem)] overflow-y-scroll inbox-messages"
      >
        {isFetchingMore && (
          <li className="py-1 text-zinc-400 text-xs text-center">
            Loading older messages...
          </li>
        )}
        {messagesResult && (
          <TooltipProvider delayDuration={200}>
            {messagesResult.messages.map((message: Message, index) => (
              <li key={message.id} className={index === 0 ? "mt-auto" : undefined}>
                <MessageBubble
                  message={message}
                  isOwn={message.authorId === user?.id}
                />
              </li>
            ))}
          </TooltipProvider>
        )}
      </ul>

      <div className="flex items-center gap-2 mx-4">
        <Input
          onChange={(e) => setText(e.target.value)}
          onKeyUp={(e) => e.key === "Enter" && handleSendMessage()}
          value={text}
          type="email"
          placeholder="Write Message"
        />
        <Button onClick={handleSendMessage}>Send</Button>
      </div>
    </div>
  )
}
export default Inbox
