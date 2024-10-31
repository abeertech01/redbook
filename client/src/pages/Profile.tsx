import Navbar from "@/components/Navbar"
import PostCard from "@/components/PostCard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import React, { useState } from "react"

type ProfileProps = {}

const Profile: React.FC<ProfileProps> = () => {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className="min-h-screen">
      <Navbar />
      <ScrollArea className="w-full h-[calc(100vh-3.5rem)]">
        <div className="w-full md:w-4/6 lg:w-7/12 h-full mx-auto">
          <div className="relative w-full h-[12rem] md:h-[20rem] mb-[8rem]">
            {isLoading && (
              <div className="absolute w-full h-full bg-gray-300 animate-pulse rounded-bl-md rounded-br-md"></div>
            )}
            <img
              src="https://cdn.pixabay.com/photo/2021/01/01/14/29/skiing-5878729_1280.jpg"
              alt="cover photo"
              className={`absolute w-full h-full object-cover rounded-bl-md rounded-br-md transition-opacity duration-500 ${
                isLoading ? "opacity-0" : "opacity-100"
              }`}
              onLoad={() => setIsLoading(false)}
            />

            <div className="absolute bottom-0 left-[3rem] translate-y-3/4 flex gap-4 items-center">
              <Avatar className="border w-[5rem] h-[5rem] md:w-[7rem] md:h-[7rem]">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>

              <h1 className="text-xl md:text-2xl font-bold">John Doe</h1>
            </div>
          </div>

          <div className="w-full grid md:grid-rows-[auto_auto] lg:grid-cols-[34%_auto] gap-3 items-start p-3 md:p-0">
            <Card className="p-4">
              <ul className="flex flex-col gap-3 overflow-x-hidden">
                <li>
                  <h1 className="text-lg font-semibold underline">Username</h1>
                  <p>@johndoe01</p>
                </li>
                <li>
                  <h1 className="text-lg font-semibold underline">Email</h1>
                  <p className="truncate overflow-hidden text-ellipsis whitespace-nowrap">
                    john.technology@gmail.com
                  </p>
                </li>
                <li>
                  <h1 className="text-lg font-semibold underline">Bio</h1>
                  <p>
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                    Hic consequuntur, officia ea incidunt voluptas quam
                    aspernatur numquam cupiditate excepturi animi.
                  </p>
                </li>
                <li>
                  <h1 className="text-lg font-semibold underline">Joined</h1>
                  <p>10th June, 2024</p>
                </li>
              </ul>
            </Card>
            <div>
              <ul className="flex flex-col gap-3">
                <li>
                  <PostCard />
                </li>
                <li>
                  <PostCard />
                </li>
                <li>
                  <PostCard />
                </li>
              </ul>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
export default Profile
