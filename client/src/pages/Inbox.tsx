import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import clsx from "clsx"
import React, { useEffect, useRef } from "react"
// import { useLocation } from "react-router-dom"

const messages = [
  {
    name: "john",
    message: "hello",
  },
  {
    name: "smith",
    message: "hello buddy. What's up",
  },
  {
    name: "john",
    message: "I am good",
  },
  {
    name: "john",
    message: "hello",
  },
  {
    name: "smith",
    message: "hello buddy. What's up",
  },
  {
    name: "john",
    message: "I am good",
  },
  {
    name: "john",
    message: "hello",
  },
  {
    name: "smith",
    message: "hello buddy. What's up",
  },
  {
    name: "john",
    message: "I am good",
  },
  {
    name: "john",
    message: "hello",
  },
  {
    name: "smith",
    message: "hello buddy. What's up",
  },
  {
    name: "john",
    message: "I am good",
  },
]

type InboxProps = {}

const Inbox: React.FC<InboxProps> = () => {
  // const { pathname } = useLocation()
  const reversedMessages = messages.reverse()
  const scrollRef = useRef<HTMLUListElement>(null)

  // const chatId = pathname.match(/\/messages\/(.*)/)![1]

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
    console.log(scrollRef.current?.scrollTop)
  }, [])

  return (
    <div className="h-full grid grid-row-[auto_auto_auto] gap-4">
      <Card className="bg-secondary px-4 py-2 mx-4 flex gap-3 items-center">
        <Avatar className="w-8 h-8">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>

        <h1 className="font-bold text-xl">John Doe</h1>
      </Card>

      <ul
        ref={scrollRef}
        className="relative flex-1 flex flex-col gap-4 pl-5 pr-[0.6rem] h-full overflow-y-scroll scroll-smooth scrollbar-thin scrollbar-thumb-secondary scrollbar-track-transparent"
      >
        {reversedMessages.map((message) => (
          <li
            className={clsx(
              "flex flex-col gap-1",
              message.name === "john" ? "items-end" : "items-start"
            )}
          >
            <div className="flex items-center gap-1 text-gray-500">
              <small>{message.name}</small>
              <div>•</div>
              <small>12:00</small>
            </div>
            <Card
              className={clsx(
                "px-3 py-1",
                message.name === "john"
                  ? "bg-zinc-500 text-white"
                  : "bg-rose-600 text-white dark:text-white"
              )}
            >
              {message.message}
            </Card>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-2 mx-4">
        <Input type="email" placeholder="Write Message" />
        <Button type="submit">Send</Button>
      </div>
    </div>
  )
}
export default Inbox
