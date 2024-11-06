import { AxiosError } from "@/utility/types"
import { createContext, useContext } from "react"
import { Socket, io } from "socket.io-client"

function isAxiosError(error: any): error is AxiosError {
  return (
    error.response &&
    error.response.data &&
    typeof error.response.data.message === "string"
  )
}

function upvoteCacheHelper<
  T extends { upvoteIds: string[]; downvoteIds: string[] }
>(draftItem: T, authorId: string) {
  if (draftItem.downvoteIds.includes(authorId)) {
    draftItem.downvoteIds = draftItem.downvoteIds.filter(
      (downvoteId) => downvoteId !== authorId
    )
    draftItem.upvoteIds.push(authorId)
  } else {
    if (draftItem.upvoteIds.includes(authorId)) {
      draftItem.upvoteIds = draftItem.upvoteIds.filter(
        (upvoteId) => upvoteId !== authorId
      )
    } else {
      draftItem.upvoteIds.push(authorId)
    }
  }
}

function downvoteCacheHelper<
  T extends { upvoteIds: string[]; downvoteIds: string[] }
>(draftItem: T, authorId: string) {
  if (draftItem.upvoteIds.includes(authorId)) {
    draftItem.upvoteIds = draftItem.upvoteIds.filter(
      (upvoteId) => upvoteId !== authorId
    )

    draftItem.downvoteIds.push(authorId)
  } else {
    if (draftItem.downvoteIds.includes(authorId)) {
      draftItem.downvoteIds = draftItem.downvoteIds.filter(
        (downvoteId) => downvoteId !== authorId
      )
    } else {
      draftItem.downvoteIds.push(authorId)
    }
  }
}

function timeAgo(timestamp: Date, locale = "en") {
  let value
  const diff = (new Date().getTime() - new Date(timestamp).getTime()) / 1000
  const minutes = Math.floor(diff / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(months / 12)
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })

  if (years > 0) {
    value = rtf.format(0 - years, "year")
  } else if (months > 0) {
    value = rtf.format(0 - months, "month")
  } else if (days > 0) {
    value = rtf.format(0 - days, "day")
  } else if (hours > 0) {
    value = rtf.format(0 - hours, "hour")
  } else if (minutes > 0) {
    value = rtf.format(0 - minutes, "minute")
  } else {
    value = rtf.format(0 - diff, "second")
  }
  return value
}

function formatHumanReadTimestamp(timestamp: Date) {
  const date = new Date(timestamp)

  const day = date.getDate()
  const month = date.toLocaleString("default", { month: "long" })
  const year = date.getFullYear()

  const daySuffix = (d: number) => {
    if (d > 3 && d < 21) return "th"
    switch (d % 10) {
      case 1:
        return "st"
      case 2:
        return "nd"
      case 3:
        return "rd"
      default:
        return "th"
    }
  }

  return `${day}${daySuffix(day)} ${month}, ${year}`
}

export {
  isAxiosError,
  upvoteCacheHelper,
  downvoteCacheHelper,
  timeAgo,
  formatHumanReadTimestamp,
}
