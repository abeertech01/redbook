import { useAddCommentMutation } from "@/app/api/comment"
import {
  useDeletePostMutation,
  useDownvotePostMutation,
  useGetPostQuery,
  useUpvotePostMutation,
} from "@/app/api/post"
import { RootState } from "@/app/store"
import Comments from "@/components/Comments"
import Navbar from "@/components/Navbar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { timeAgo } from "@/lib/helper"
import clsx from "clsx"
import {
  ArrowBigDown,
  ArrowBigUp,
  CircleEllipsis,
  MessageSquareText,
  Trash,
} from "lucide-react"
import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"

type PostProps = {}

const Post: React.FC<PostProps> = () => {
  const [commentText, setCommentText] = useState("")
  const [commentNumber, setCommentNumber] = useState<number>(0)
  const [timeDiff, setTimeDiff] = useState("")
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useSelector((state: RootState) => state.user)
  const { data } = useGetPostQuery(id as string)
  const { toast } = useToast()
  const [deletePost, { isLoading: deleteLoading }] = useDeletePostMutation()
  const [addComment, { isLoading: addCommentLoading }] = useAddCommentMutation()
  const [upvotePost, { isLoading: uv_loading }] = useUpvotePostMutation()
  const [downvotePost, { isLoading: dv_loading }] = useDownvotePostMutation()

  const deletePostClick = async () => {
    if (user?.id !== data?.post.authorId) {
      toast({
        title: "You are not authorized to delete this post",
        variant: "destructive",
      })
      return
    }

    const result = await deletePost(data?.post.id!)

    if (result.data?.success) {
      toast({
        title: "Post Deleted Successfully",
      })
      navigate("/")
    }
  }

  const submitComment = async () => {
    const comment = await addComment({
      postId: id as string,
      content: commentText,
    })

    if (comment) {
      setCommentText("")
      toast({
        title: "Comment Added Successfully",
      })
    }
  }

  useEffect(() => {
    if (data?.success) {
      setTimeDiff(timeAgo(data.post.createdAt as Date))
    }
  }, [data])

  return (
    <div>
      <Navbar />
      <div className="min-h-[calc(100vh-3.5rem)] w-[47rem] mx-auto py-4">
        <Card>
          <CardHeader>
            <CardTitle>{data?.post.title}</CardTitle>
            <CardDescription className="py-2">
              <div className="flex gap-1 items-center">
                <Avatar className="w-[1.8rem] h-[1.8rem]">
                  <AvatarImage src={data?.post.author?.profileImgUrl} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div>{data?.post.author?.name}</div>
                <div>•</div>
                <div>{timeDiff}</div>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="">{data?.post.content}</p>
          </CardContent>
          <CardFooter className="flex flex-col items-start">
            <div className="w-full flex justify-between items-center mb-4">
              <div className="flex gap-2 items-center">
                {/* Upvote */}
                <Button
                  disabled={uv_loading || dv_loading}
                  onClick={() => upvotePost(data?.post.id!)}
                  variant={"outline"}
                  className={clsx(
                    data?.post.upvoteIds.includes(user?.id!) &&
                      "bg-gradient-to-r from-rose-500 to-red-400 text-white hover:text-white hover:to-yellow-500"
                  )}
                >
                  <ArrowBigUp className="scale-125" />{" "}
                  {data?.post.upvoteIds.length}
                </Button>
                <div>|</div>
                {/* Downvote */}
                <Button
                  disabled={uv_loading || dv_loading}
                  onClick={() => downvotePost(data?.post.id!)}
                  variant={"outline"}
                  className={clsx(
                    data?.post.downvoteIds.includes(user?.id!) &&
                      "bg-gradient-to-r from-rose-500 to-red-400 text-white hover:text-white hover:to-yellow-500"
                  )}
                >
                  <ArrowBigDown className="scale-125" />{" "}
                  {data?.post.downvoteIds.length}
                </Button>
                <div>|</div>
                {/* Comment */}
                <Button variant={"outline"}>
                  <MessageSquareText className="scale-125" /> {commentNumber}
                </Button>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant={"ghost"} size={"icon"}>
                    <CircleEllipsis />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel className="text-center">
                    More Options
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Button
                      disabled={deleteLoading}
                      onClick={deletePostClick}
                      variant={"ghost"}
                    >
                      Delete Post <Trash />
                    </Button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="w-full h-[1px] bg-zinc-500 mb-4"></div>

            {/* Comment Area */}
            <div className="flex flex-col w-full gap-2 mb-4">
              <Textarea
                rows={1}
                placeholder="Comment..."
                onChange={(e) => setCommentText(e.target.value)}
                className="focus-visible:outline-none"
              />
              <Button
                onClick={submitComment}
                variant={"secondary"}
                disabled={addCommentLoading}
              >
                Comment
              </Button>
            </div>

            {/* All Comments */}
            <Comments
              postId={data?.post.id!}
              setCommentNumber={setCommentNumber}
            />
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
export default Post
