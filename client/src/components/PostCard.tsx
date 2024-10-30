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

type PostCardProps = {}

const PostCard: React.FC<PostCardProps> = () => {
  const navigate = useNavigate()

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Cupiditate
          nobis rem doloremque?
        </CardTitle>
        <CardDescription className="py-2">
          <div className="flex gap-1 items-center">
            <Avatar className="w-[1.8rem] h-[1.8rem]">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>John Doe</div>
            <div>•</div>
            <div>2 hour ago</div>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Impedit
          necessitatibus explicabo unde nihil incidunt voluptatem eveniet
          quibusdam praesentium temporibus ipsam molestiae accusantium nesciunt
          sunt similique voluptas, pariatur quisquam cumque voluptatum!
        </p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant={"outline"}>
          <ArrowBigUp className="scale-125" /> 100
        </Button>
        <div>|</div>
        <Button variant={"outline"}>
          <ArrowBigDown className="scale-125" /> 100
        </Button>
        <div>|</div>
        <Button onClick={() => navigate("/post/4")} variant={"outline"}>
          <MessageSquareText className="scale-125" /> 100
        </Button>
      </CardFooter>
    </Card>
  )
}
export default PostCard
