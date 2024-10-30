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
import { Textarea } from "@/components/ui/textarea"
import { ArrowBigDown, ArrowBigUp, MessageSquareText } from "lucide-react"
import React from "react"

type PostProps = {}

const Post: React.FC<PostProps> = () => {
  return (
    <div>
      <Navbar />
      <div className="min-h-[calc(100vh-3.5rem)] w-[47rem] mx-auto py-4">
        <Card>
          <CardHeader>
            <CardTitle>
              Lorem ipsum dolor, sit amet consectetur adipisicing elit.
              Cupiditate nobis rem doloremque?
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
              quibusdam praesentium temporibus ipsam molestiae accusantium
              nesciunt sunt similique voluptas, pariatur quisquam cumque
              voluptatum!
            </p>
          </CardContent>
          <CardFooter className="flex flex-col items-start">
            <div className="flex items-center gap-2 mb-4">
              <Button variant={"outline"}>
                <ArrowBigUp className="scale-125" /> 100
              </Button>
              <div>|</div>
              <Button variant={"outline"}>
                <ArrowBigDown className="scale-125" /> 100
              </Button>
              <div>|</div>
              <Button variant={"outline"}>
                <MessageSquareText className="scale-125" /> 100
              </Button>
            </div>
            <div className="w-full h-[1px] bg-zinc-500 mb-4"></div>

            <div className="flex flex-col w-full gap-2 mb-4">
              <Textarea
                rows={1}
                placeholder="Comment..."
                className="focus-visible:outline-none"
              />
              <Button variant={"secondary"}>Comment</Button>
            </div>

            <ul className="w-full flex flex-col gap-4">
              <li className="flex w-full space-x-2">
                <Avatar className="w-[2.5rem] h-[2.5rem]">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>

                <Card className="px-3 py-2">
                  <CardDescription>
                    <h1>
                      <span>John Doe</span> • <span>2 hour ago</span>
                    </h1>
                  </CardDescription>
                  <p className="mb-4">
                    Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                    Ipsa quia optio recusandae error eaque quasi aspernatur
                    delectus quam. Minus, nobis.
                  </p>

                  <div className="flex items-center gap-2">
                    <Button variant={"secondary"}>
                      <ArrowBigUp className="scale-125" /> 100
                    </Button>
                    <div>|</div>
                    <Button variant={"secondary"}>
                      <ArrowBigDown className="scale-125" /> 100
                    </Button>
                  </div>
                </Card>
              </li>
            </ul>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
export default Post
