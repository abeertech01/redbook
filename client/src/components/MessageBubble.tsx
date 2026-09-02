import { useState } from "react"
import clsx from "clsx"
import { Card } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatExactMessageTime } from "@/lib/helper"
import { Message } from "@/utility/types"

type MessageBubbleProps = {
  message: Message
  isOwn: boolean
}

const MessageBubble = ({ message, isOwn }: MessageBubbleProps) => {
  const [showMobileTime, setShowMobileTime] = useState(false)

  return (
    <div
      className={clsx(
        "flex flex-col gap-1",
        isOwn ? "items-end" : "items-start"
      )}
    >
      <div className="md:hidden">
        {showMobileTime && (
          <div className="mb-1 text-xs text-gray-500">
            {formatExactMessageTime(message.createdAt)}
          </div>
        )}
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            onClick={() => setShowMobileTime((prev) => !prev)}
            className={clsx(
              "cursor-pointer px-3 py-1 md:cursor-default",
              isOwn
                ? "bg-zinc-500 text-white"
                : "bg-rose-600 text-white dark:text-white"
            )}
          >
            {message.text}
          </Card>
        </TooltipTrigger>
        <TooltipContent side={isOwn ? "left" : "right"} className="hidden md:block">
          {formatExactMessageTime(message.createdAt)}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

export default MessageBubble
