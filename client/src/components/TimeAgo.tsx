import { memo } from "react"
import { formatPostTimestamp, timeAgo } from "@/lib/helper"

type TimeAgoProps = {
  timestamp: Date
  /**
   * "relative" (default) keeps showing a relative time forever - used for
   * chat, where it's never expected to switch to an absolute date.
   * "date" switches to an absolute date once the timestamp is older than
   * yesterday - used for posts/comments/notifications.
   */
  variant?: "relative" | "date"
}

const TimeAgo = memo(function TimeAgo({
  timestamp,
  variant = "relative",
}: TimeAgoProps) {
  return (
    <>{variant === "date" ? formatPostTimestamp(timestamp) : timeAgo(timestamp)}</>
  )
})

export default TimeAgo
