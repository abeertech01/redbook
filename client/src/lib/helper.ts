import { AxiosError } from "@/utility/types"

function isAxiosError(error: unknown): error is AxiosError {
  if (typeof error !== "object" || error === null) return false

  const err = error as { response?: { data?: { message?: unknown } } }
  return typeof err.response?.data?.message === "string"
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
    value = rtf.format(0 - Math.floor(diff), "second")
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

function formatClockTime(date: Date) {
  let hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, "0")
  const ampm = hours >= 12 ? "pm" : "am"
  hours = hours % 12 || 12

  return `${hours}:${minutes}${ampm}`
}

function formatExactMessageTime(timestamp: Date) {
  const date = new Date(timestamp)
  const now = new Date()

  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

  const daysDiff = Math.round((startOfDay(now) - startOfDay(date)) / 86400000)
  const time = formatClockTime(date)

  if (daysDiff === 0) return `Today, ${time}`
  if (daysDiff === 1) return `Yesterday, ${time}`

  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()

  return `${time}, ${day}/${month}/${year}`
}

export {
  isAxiosError,
  upvoteCacheHelper,
  downvoteCacheHelper,
  timeAgo,
  formatHumanReadTimestamp,
  formatExactMessageTime,
}
