import { AxiosError } from "@/utility/types"

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

export { isAxiosError, upvoteCacheHelper, downvoteCacheHelper }
