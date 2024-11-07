import { useGetUserPostsQuery } from "@/app/api/post"
import { useUpdateBioMutation } from "@/app/api/user"
import { AppDispatch, RootState } from "@/app/store"
import Navbar from "@/components/Navbar"
import PostCard from "@/components/PostCard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { formatHumanReadTimestamp } from "@/lib/helper"
import { Camera, CameraIcon, Edit, SquareCheckBig } from "lucide-react"
import React, { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { updateBio as updateBioReducer } from "@/app/reducers/user"
import { useToast } from "@/hooks/use-toast"

type ProfileProps = {}

const Profile: React.FC<ProfileProps> = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.user)
  const [isLoading, setIsLoading] = useState(true)
  const [isBioEditing, setIsBioEditing] = useState(false)
  const [bioText, setBioText] = useState(user?.bio)
  const { toast } = useToast()

  const { data } = useGetUserPostsQuery(user?.id!)
  const [updateBio] = useUpdateBioMutation()

  const editBio = async () => {
    if (isBioEditing && bioText && bioText !== user?.bio) {
      const theBioResult = await updateBio(bioText).unwrap()

      await dispatch(updateBioReducer(theBioResult.user.bio))
    }

    if (isBioEditing && bioText === user?.bio) {
      toast({
        variant: "destructive",
        title: "No changes made",
      })
    }

    if (isBioEditing && !bioText) {
      toast({
        variant: "destructive",
        title: "Bio cannot be empty",
      })
    }

    setIsBioEditing((prev) => !prev)
  }

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
              <div className="relative w-[5rem] h-[5rem] md:w-[7rem] md:h-[7rem] group">
                <Avatar className="border w-full h-full md:w-[7rem] md:h-[7rem]">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="absolute top-0 w-[5rem] h-[5rem] md:w-[7rem] md:h-[7rem] shadow-md custom-glow rounded-full hidden group-hover:block">
                  <Button className="w-full h-full rounded-full bg-transparent hover:bg-rose-500/50 text-white">
                    <Camera className="scale-150" /> Change
                  </Button>
                </div>
              </div>

              <h1 className="text-xl md:text-2xl font-bold">{user?.name}</h1>
            </div>
            <div className="absolute bottom-2 right-2 flex gap-4 items-center shadow-md custom-glow">
              <Button
                variant={"secondary"}
                className="bg-rose-500 hover:bg-rose-600 text-white"
              >
                <CameraIcon />
                Edit Cover Photo
              </Button>
            </div>
          </div>

          <div className="w-full grid md:grid-rows-[auto_auto] lg:grid-cols-[34%_auto] gap-3 items-start p-3 md:p-0">
            <Card className="p-4">
              <ul className="flex flex-col gap-3 overflow-x-hidden">
                <li>
                  <h1 className="text-lg font-semibold underline">Username</h1>
                  <p>@{user?.username}</p>
                </li>
                <li>
                  <h1 className="text-lg font-semibold underline">Email</h1>
                  <p className="truncate overflow-hidden text-ellipsis whitespace-nowrap">
                    {user?.email}
                  </p>
                </li>
                <li>
                  <h1 className="text-lg font-semibold underline">
                    Bio{" "}
                    <Button
                      onClick={editBio}
                      size={"icon"}
                      variant={"ghost"}
                      className="hover:bg-transparent"
                    >
                      {!isBioEditing ? (
                        <Edit className="text-zinc-500" />
                      ) : (
                        <SquareCheckBig className="text-zinc-500" />
                      )}
                    </Button>
                  </h1>
                  {!isBioEditing && (
                    <p>
                      {user && user.bio
                        ? user.bio
                        : "Add something about yourself."}
                    </p>
                  )}
                  {isBioEditing && (
                    <Textarea
                      value={bioText}
                      onChange={(e) => setBioText(e.target.value)}
                      className="border"
                    />
                  )}
                </li>
                <li>
                  <h1 className="text-lg font-semibold underline">Joined</h1>
                  <p>{formatHumanReadTimestamp(user?.createdAt as Date)}</p>
                </li>
              </ul>
            </Card>
            <div>
              <ul className="flex flex-col gap-3">
                {data?.posts.map((post) => (
                  <PostCard key={post.id} post={post} userId={user?.id!} />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
export default Profile
