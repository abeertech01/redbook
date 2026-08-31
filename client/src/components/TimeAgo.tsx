import { memo } from "react"
import { timeAgo } from "@/lib/helper"

type TimeAgoProps = {
  timestamp: Date
}

const TimeAgo = memo(function TimeAgo({ timestamp }: TimeAgoProps) {
  return <>{timeAgo(timestamp)}</>
})

export default TimeAgo
