import React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { Button } from "./ui/button"
import { ArrowBigDown, ArrowBigUp, MessageSquareText } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { useNavigate } from "react-router-dom"
import { Post } from "@/utility/types"
import { useDownvotePostMutation, useUpvotePostMutation } from "@/app/api/post"

type PostCardProps = {
  post: Post
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
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
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>{post.author?.name}</div>
            <div>•</div>
            <div>2 hour ago</div>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="">{post.content}</p>
      </CardContent>
      <CardFooter className="flex gap-2">
        {/* Upvote */}
        <Button
          disabled={uv_loading || dv_loading}
          onClick={() => upvotePost(post.id)}
          variant={"outline"}
        >
          <ArrowBigUp className="scale-125" /> {post.upvoteIds.length}
        </Button>
        <div>|</div>
        {/* Downvote */}
        <Button
          disabled={uv_loading || dv_loading}
          onClick={() => downvotePost(post.id)}
          variant={"outline"}
        >
          <ArrowBigDown className="scale-125" /> {post.downvoteIds.length}
        </Button>
        <div>|</div>
        {/* Comment */}
        <Button
          onClick={() => navigate(`/post/${post.id}`)}
          variant={"outline"}
        >
          <MessageSquareText className="scale-125" /> 100
        </Button>
      </CardFooter>
    </Card>
  )
}
export default PostCard
