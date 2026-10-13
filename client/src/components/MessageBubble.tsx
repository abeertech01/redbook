import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatExactMessageTime } from "@/lib/helper"
import { Message, User } from "@/utility/types"
import UserAvatar from "./UserAvatar"

type MessageBubbleProps = {
  message: Message
  isOwn: boolean
  /** First/last of a run of consecutive messages from the same sender -
   * drives the bubble's corner rounding and the avatar placement. */
  first: boolean
  last: boolean
  author?: User
}

const BIG = "20px"
const SMALL = "6px"

const MessageBubble = ({ message, isOwn, first, last, author }: MessageBubbleProps) => {
  const [showMobileTime, setShowMobileTime] = useState(false)

  // Tight corners on the sender's side where bubbles stack, round elsewhere.
  const radius = isOwn
    ? `${BIG} ${first ? BIG : SMALL} ${last ? BIG : SMALL} ${BIG}`
    : `${first ? BIG : SMALL} ${BIG} ${BIG} ${last ? BIG : SMALL}`

  return (
    <div className={cn("flex flex-col gap-1", isOwn ? "items-end" : "items-start")}>
      {showMobileTime && (
        <div className={cn("text-xs text-faint md:hidden", !isOwn && "pl-9")}>
          {formatExactMessageTime(message.createdAt)}
        </div>
      )}

      <div
        className={cn(
          "flex w-full items-end gap-2",
          isOwn ? "justify-end" : "justify-start"
        )}
      >
        {!isOwn && (
          <UserAvatar
            user={author}
            className={cn("size-7 text-[10.5px]", !last && "invisible")}
          />
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              onClick={() => setShowMobileTime((prev) => !prev)}
              style={{ borderRadius: radius }}
              className={cn(
                "max-w-[68%] cursor-pointer px-3.5 py-2.25 text-[15px] leading-[1.45] wrap-break-word whitespace-pre-line text-pretty md:cursor-default",
                isOwn ? "bg-brand text-white" : "bg-bubble text-ink"
              )}
            >
              {message.text}
            </div>
          </TooltipTrigger>
          <TooltipContent side={isOwn ? "left" : "right"} className="hidden md:block">
            {formatExactMessageTime(message.createdAt)}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

export default MessageBubble
