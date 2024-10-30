import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import clsx from "clsx"
import React from "react"
import { useLocation } from "react-router-dom"

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
  const { pathname } = useLocation()
  const reversedMessages = messages.reverse()

  const chatId = pathname.match(/\/messages\/(.*)/)![1]

  console.log(chatId)

  return (
    <>
      <Card className="bg-secondary px-4 py-2 mx-4 flex gap-3 items-center">
        <Avatar className="w-8 h-8">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>

        <h1 className="font-bold text-xl">John Doe</h1>
      </Card>

      <ScrollArea className="flex-1 w-full px-4 py-2">
        <div className="h-full w-full flex flex-col justify-end">
          <ul>
            {reversedMessages.map((message) => (
              <li
                className={clsx(
                  "flex flex-col gap-1 mb-4",
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
                      ? "bg-secondary"
                      : "bg-rose-600 text-white dark:text-white"
                  )}
                >
                  {message.message}
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </ScrollArea>

      <div className="flex items-center gap-2 mx-4 mt-2">
        <Input type="email" placeholder="Write Message" />
        <Button type="submit">Send</Button>
      </div>
    </>
  )
}
export default Inbox
