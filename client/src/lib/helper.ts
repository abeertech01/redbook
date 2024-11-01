import { AxiosError, Post } from "@/utility/types"

export function isAxiosError(error: any): error is AxiosError {
  return (
    error.response &&
    error.response.data &&
    typeof error.response.data.message === "string"
  )
}

export function upvoteCacheHelper(post: Post, authorId: string) {
  if (post.downvoteIds.includes(authorId)) {
    post.downvoteIds = post.downvoteIds.filter(
      (downvoteId) => downvoteId !== authorId
    )
    post.upvoteIds.push(authorId)
  } else {
    if (post.upvoteIds.includes(authorId)) {
      post.upvoteIds = post.upvoteIds.filter(
        (upvoteId) => upvoteId !== authorId
      )
    } else {
      post.upvoteIds.push(authorId)
    }
  }
}

export function downvoteCacheHelper(post: Post, authorId: string) {
  if (post.upvoteIds.includes(authorId)) {
    post.upvoteIds = post.upvoteIds.filter((upvoteId) => upvoteId !== authorId)

    post.downvoteIds.push(authorId)
  } else {
    if (post.downvoteIds.includes(authorId)) {
      post.downvoteIds = post.downvoteIds.filter(
        (downvoteId) => downvoteId !== authorId
      )
    } else {
      post.downvoteIds.push(authorId)
    }
  }
}
