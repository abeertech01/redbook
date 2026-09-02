import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowBigDown, ArrowBigUp } from "lucide-react"
import {
  useDownvoteCommentMutation,
  useGetCommentsQuery,
  useUpvoteCommentMutation,
} from "@/app/api/comment"
import TimeAgo from "./TimeAgo"

type CommentsProps = {
  postId: string
  userId: string
  setCommentNumber: (cmts: number) => void
}

type LoadingState = {
  upvote: boolean
  downvote: boolean
}

const Comments = ({ postId, userId, setCommentNumber }: CommentsProps) => {
  const { data } = useGetCommentsQuery(postId)
  const [upvoteComment] = useUpvoteCommentMutation()
  const [downvoteComment] = useDownvoteCommentMutation()
  const [loadingStates, setLoadingStates] = useState<
    Record<string, LoadingState>
  >({})

  const handleUpvote = async (commentId: string) => {
    setLoadingStates((prev: Record<string, LoadingState>) => ({
      ...prev,
      [commentId]: { upvote: true, downvote: true },
    }))

    await upvoteComment({ commentId, postId })

    setLoadingStates((prev: Record<string, LoadingState>) => ({
      ...prev,
      [commentId]: { upvote: false, downvote: false },
    }))
  }

  const handleDownvote = async (commentId: string) => {
    setLoadingStates((prev: Record<string, LoadingState>) => ({
      ...prev,
      [commentId]: { downvote: true, upvote: true },
    }))

    await downvoteComment({ commentId, postId })

    setLoadingStates((prev: Record<string, LoadingState>) => ({
      ...prev,
      [commentId]: { downvote: false, upvote: false },
    }))
  }

  useEffect(() => {
    if (data) setCommentNumber(data.comments.length as number)
  }, [data])

  return (
    <>
      {data && data?.comments.length > 0 && (
        <ul className="flex flex-col gap-4 w-full">
          {data.comments.map((comment) => (
            <li key={comment.id} className="flex space-x-2 w-full">
              <Avatar className="w-10 h-10">
                <AvatarImage src={comment.author?.profileImgUrl} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>

              <Card className="px-3 py-2 w-full">
                <CardDescription>
                  <h1>
                    <span>{comment.author?.name}</span> •{" "}
                    <span>
                      <TimeAgo timestamp={comment.createdAt} variant="date" />
                    </span>
                  </h1>
                </CardDescription>
                <p className="mb-4">{comment.content}</p>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleUpvote(comment.id)}
                    disabled={
                      loadingStates[comment.id]?.upvote ||
                      loadingStates[comment.id]?.downvote
                    }
                    variant={
                      comment.upvoteIds.includes(userId)
                        ? "secondary"
                        : "outline"
                    }
                  >
                    <ArrowBigUp className="scale-125" />{" "}
                    {comment.upvoteIds.length}
                  </Button>
                  <div>|</div>
                  <Button
                    onClick={() => handleDownvote(comment.id)}
                    disabled={
                      loadingStates[comment.id]?.upvote ||
                      loadingStates[comment.id]?.downvote
                    }
                    variant={
                      comment.downvoteIds.includes(userId)
                        ? "secondary"
                        : "outline"
                    }
                  >
                    <ArrowBigDown className="scale-125" />{" "}
                    {comment.downvoteIds.length}
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
export default Comments
