import { Post } from "@/utility/types"
import React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "./ui/button"
import { ArrowBigDown, ArrowBigUp, MessageSquareText } from "lucide-react"
import { useDownvotePostMutation, useUpvotePostMutation } from "@/app/api/post"
import clsx from "clsx"
import { useNavigate } from "react-router-dom"
import { timeAgo } from "@/lib/helper"

type PostCardProps = {
  post: Post
  userId: string
}

const PostCard: React.FC<PostCardProps> = ({ post, userId }) => {
  const navigate = useNavigate()
  const [upvotePost, { isLoading: uv_loading }] = useUpvotePostMutation()
  const [downvotePost, { isLoading: dv_loading }] = useDownvotePostMutation()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{post.title}</CardTitle>
        <CardDescription className="py-2">
          <div className="flex gap-1 items-center">
            <Avatar className="w-[1.8rem] h-[1.8rem]">
              <AvatarImage src={post.author?.profileImgUrl} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>{post.author?.name}</div>
            <div>•</div>
            <div>{timeAgo(post.createdAt)}</div>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>{post.content}</p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <div className="w-full flex justify-between items-center">
          <div className="flex gap-2 items-center">
            {/* Upvote */}
            <Button
              disabled={uv_loading || dv_loading}
              onClick={() => upvotePost(post.id)}
              variant={"outline"}
              className={clsx(
                post.upvoteIds.includes(userId) &&
                  "bg-gradient-to-r from-rose-500 to-red-400 text-white hover:text-white hover:to-yellow-500"
              )}
            >
              <ArrowBigUp className="scale-125" /> {post.upvoteIds.length}
            </Button>
            <div>|</div>
            {/* Downvote */}
            <Button
              disabled={uv_loading || dv_loading}
              onClick={() => downvotePost(post.id)}
              variant={"outline"}
              className={clsx(
                post.downvoteIds.includes(userId) &&
                  "bg-gradient-to-r from-rose-500 to-red-400 text-white hover:text-white hover:to-yellow-500"
              )}
            >
              <ArrowBigDown className="scale-125" /> {post.downvoteIds.length}
            </Button>
            <div>|</div>
            {/* Comment */}
            <Button
              onClick={() => navigate(`/post/${post.id}`)}
              variant={"outline"}
            >
              <MessageSquareText className="scale-125" />{" "}
              {post.comments?.length}
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
export default PostCard
