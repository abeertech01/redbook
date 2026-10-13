import { useState } from "react"
import {
  useDownvoteCommentMutation,
  useGetCommentsQuery,
  useUpvoteCommentMutation,
} from "@/app/api/comment"
import TimeAgo from "./TimeAgo"
import UserAvatar from "./UserAvatar"
import VoteControls from "./VoteControls"

type CommentsProps = {
  postId: string
  userId: string
}

const Comments = ({ postId, userId }: CommentsProps) => {
  const { data } = useGetCommentsQuery(postId)
  const [upvoteComment] = useUpvoteCommentMutation()
  const [downvoteComment] = useDownvoteCommentMutation()
  // Comment ids with a vote request in flight, so a comment's buttons are
  // disabled until its own request settles without blocking the others.
  const [pending, setPending] = useState<Set<string>>(new Set())

  const vote = async (commentId: string, direction: "up" | "down") => {
    setPending((prev) => new Set(prev).add(commentId))

    await (direction === "up" ? upvoteComment : downvoteComment)({
      commentId,
      postId,
    })

    setPending((prev) => {
      const next = new Set(prev)
      next.delete(commentId)
      return next
    })
  }

  if (!data || data.comments.length === 0) return null

  return (
    <div className="flex flex-col gap-1 px-1">
      {data.comments.map((comment) => (
        <div
          key={comment.id}
          className="flex gap-3.5 border-b border-chip py-3.5 last:border-b-0"
        >
          <UserAvatar user={comment.author} className="size-9.5 text-[13px]" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="text-[13.5px]">
              <span className="font-semibold text-ink">{comment.author?.name}</span>{" "}
              <span className="text-mute-2">
                · <TimeAgo timestamp={comment.createdAt} variant="date" />
              </span>
            </div>
            <div className="text-[15px] leading-normal whitespace-pre-line text-ink-2">
              {comment.content}
            </div>
            <div className="-ml-2">
              <VoteControls
                variant="plain"
                upvoteIds={comment.upvoteIds}
                downvoteIds={comment.downvoteIds}
                userId={userId}
                onUpvote={() => vote(comment.id, "up")}
                onDownvote={() => vote(comment.id, "down")}
                disabled={pending.has(comment.id)}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
export default Comments
