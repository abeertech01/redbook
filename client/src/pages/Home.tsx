import { RootState } from "@/app/store"
import AllPosts from "@/components/AllPosts"
import Navbar from "@/components/Navbar"
import PostCreate from "@/components/PostCreate"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import React from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"

type HomeProps = {}

const Home: React.FC<HomeProps> = () => {
  const { user } = useSelector((state: RootState) => state.user)

  return (
    <div>
      <Navbar />
      {/* 768 = 14rem + 20rem + 14rem = 48 */}

      <div className="md:grid md:grid-cols-[minmax(13rem,_22rem)_minmax(22rem,_auto)_minmax(13rem,_22rem)]">
        <ScrollArea className="h-[calc(100vh-3.5rem)] p-2">
          <div className="min-h-full flex flex-col gap-2 items-start p-4 bg-secondary rounded-md shadow-md">
            <Link to={"/profile"} className="text-md hover:underline">
              Profile
            </Link>

            <Link to={"/messages"} className="text-md hover:underline">
              Messages
            </Link>

            <Link to={"#"} className="text-md hover:underline">
              Marketplace
            </Link>
          </div>
        </ScrollArea>

        <div className="min-h-[calc(100vh-3.5rem)]">
          <div className="h-full md:px-2 lg:px-0 md:full lg:w-9/12 mx-auto flex flex-col gap-4 py-4">
            <PostCreate />

            <div className="relative h-[calc(100vh-9.25rem)] before:w-[calc(100%-0.75rem)] before:min-h-6 before:absolute before:top-0 before:border-t before:border-t-rose-500 before:rounded-xl before:z-40 after:w-[calc(100%-0.75rem)] after:min-h-6 after:absolute after:bottom-0 after:border-b after:border-b-rose-500 after:rounded-xl after:z-40">
              {/* Top Corners */}
              <div className="w-[0.75rem] h-[0.75rem] absolute left-0 bg-background z-30"></div>
              <div className="w-[0.75rem] h-[0.75rem] absolute right-3 bg-background z-30"></div>

              {/* Bottom Corners */}
              <div className="w-[0.75rem] h-[0.75rem] absolute bottom-0 left-0 bg-background z-30"></div>
              <div className="w-[0.75rem] h-[0.75rem] absolute bottom-0 right-3 bg-background z-30"></div>

              <AllPosts userId={user?.id!} />
            </div>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-3.5rem)] p-2">
          <div className="min-h-full py-4 px-6 bg-secondary rounded-md shadow-md">
            <h1 className="underline mb-4">People You may want to chat with</h1>
            <ul className="flex flex-col gap-3">
              {Array(10)
                .fill(null)
                .map((_, i: number) => (
                  <li key={i} className="flex gap-2 items-center">
                    <Avatar className="w-7 h-7">
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <span>John Doe</span>
                  </li>
                ))}
            </ul>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
export default Home
