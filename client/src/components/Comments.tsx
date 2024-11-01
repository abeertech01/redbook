import React, { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowBigDown, ArrowBigUp } from "lucide-react"
import {
  useDownvoteCommentMutation,
  useGetCommentsQuery,
  useUpvoteCommentMutation,
} from "@/app/api/comment"

type CommentsProps = {
  postId: string
  setCommentNumber: (cmts: number) => void
}

type LoadingState = {
  upvote: boolean
  downvote: boolean
}

const Comments: React.FC<CommentsProps> = ({ postId, setCommentNumber }) => {
  const { data, isLoading: _ } = useGetCommentsQuery(postId)
  const [upvoteComment] = useUpvoteCommentMutation()
  const [downvoteComment] = useDownvoteCommentMutation()
  const [loadingStates, setLoadingStates] = useState<
    Record<string, LoadingState>
  >({})

  const handleUpvote = async (commentId: string) => {
    setLoadingStates((prev: any) => ({
      ...prev,
      [commentId]: { upvote: true, downvote: true },
    }))

    await upvoteComment({ commentId, postId })

    setLoadingStates((prev: any) => ({
      ...prev,
      [commentId]: { upvote: false, downvote: false },
    }))
  }

  const handleDownvote = async (commentId: string) => {
    setLoadingStates((prev: any) => ({
      ...prev,
      [commentId]: { downvote: true, upvote: true },
    }))

    await downvoteComment({ commentId, postId })

    setLoadingStates((prev: any) => ({
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
        <ul className="w-full flex flex-col gap-4">
          {data.comments.map((comment) => (
            <li className="w-full flex space-x-2">
              <Avatar className="w-[2.5rem] h-[2.5rem]">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>

              <Card className="w-full px-3 py-2">
                <CardDescription>
                  <h1>
                    <span>{comment.author?.name}</span> •{" "}
                    <span>2 hour ago</span>
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
                    variant={"secondary"}
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
                    variant={"secondary"}
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
