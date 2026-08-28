import { useGetUserPostsQuery } from "@/app/api/post"
import {
  useUpdateBioMutation,
  useUploadCoverImageMutation,
  useUploadProfileImageMutation,
} from "@/app/api/user"
import { AppDispatch, RootState } from "@/app/store"
import Navbar from "@/components/Navbar"
import PostCard from "@/components/PostCard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { formatHumanReadTimestamp } from "@/lib/helper"
import {
  Camera,
  CameraIcon,
  Edit,
  LoaderPinwheel,
  SquareCheckBig,
} from "lucide-react"
import { ChangeEvent, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  updateBio as updateBioReducer,
  updateCoverImageUrl,
  updateProfileImageUrl,
} from "@/app/reducers/user"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"

const Profile = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.user)
  const [isLoading, setIsLoading] = useState(true)
  const [isBioEditing, setIsBioEditing] = useState(false)
  const [bioText, setBioText] = useState(user?.bio ?? "")

  const { data: postsResult } = useGetUserPostsQuery(user!.id)
  const [updateBio] = useUpdateBioMutation()
  const [
    uploadProfileImage,
    { isLoading: uploadingProfileImg, isSuccess: uploadedProfileImg },
  ] = useUploadProfileImageMutation()
  const [
    uploadCoverImage,
    { isLoading: uploadingCoverImg, isSuccess: uploadedCoverImg },
  ] = useUploadCoverImageMutation()

  const editBio = async () => {
    if (isBioEditing && bioText && bioText !== user?.bio) {
      const theBioResult = await updateBio(bioText).unwrap()

      await dispatch(updateBioReducer(theBioResult.user.bio))
    }

    if (isBioEditing && bioText === user?.bio) {
      toast.error("No changes made")
    }

    if (isBioEditing && !bioText) {
      toast.error("Bio cannot be empty")
    }

    setIsBioEditing((prev) => !prev)
  }

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files

    if (files!.length > 0) {
      const formData = new FormData()

      await formData.append("profileImage", files![0])

      const updatedUserData = await uploadProfileImage(formData)

      dispatch(updateProfileImageUrl(updatedUserData.data?.user.profileImgUrl))
    }
  }

  const handleCoverChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files

    if (files!.length > 0) {
      const formData = new FormData()

      await formData.append("coverImage", files![0])

      const updatedUserData = await uploadCoverImage(formData)

      dispatch(updateCoverImageUrl(updatedUserData.data?.user.coverImgUrl))
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <ScrollArea className="w-full h-[calc(100vh-3.5rem)]">
        <div className="mx-auto w-full md:w-4/6 lg:w-7/12 h-full">
          <div className="relative mb-32 w-full h-48 md:h-80">
            {uploadingCoverImg && !uploadedCoverImg ? (
              (isLoading || uploadingCoverImg) && (
                <div className="top-0 z-40 absolute flex justify-center items-center bg-zinc-500 rounded-bl-md rounded-br-md w-full h-full">
                  <LoaderPinwheel className="text-xl animate-spin" />
                </div>
              )
            ) : (
              <img
                src={user?.coverImgUrl}
                alt="cover photo"
                className={`absolute z-30 w-full h-full object-cover rounded-bl-md rounded-br-md transition-opacity duration-500 ${
                  isLoading ? "opacity-0" : "opacity-100"
                }`}
                onLoad={() => setIsLoading(false)}
              />
            )}

            <div className="bottom-0 left-12 z-40 absolute flex items-center gap-4 translate-y-3/4">
              <div className="group relative w-20 md:w-28 h-20 md:h-28">
                <Avatar className="border w-full md:w-28 h-full md:h-28">
                  <AvatarImage
                    src={user?.profileImgUrl}
                    className="object-cover"
                  />
                  <AvatarFallback>
                    <div className="top-0 z-40 absolute flex justify-center items-center bg-zinc-500 rounded-full w-full h-full">
                      <LoaderPinwheel className="animate-spin" />
                    </div>
                  </AvatarFallback>
                </Avatar>
                {uploadingProfileImg && !uploadedProfileImg ? (
                  <div className="top-0 z-40 absolute flex justify-center items-center bg-zinc-500 rounded-full w-full h-full">
                    <LoaderPinwheel className="animate-spin" />
                  </div>
                ) : (
                  <div className="group hidden group-hover:block top-0 absolute shadow-md rounded-full w-20 md:w-28 h-20 md:h-28 custom-glow">
                    <div className="z-30 relative flex justify-center items-center bg-transparent group-hover:bg-rose-500/60 rounded-full w-full h-full text-white">
                      <Camera className="scale-150" />
                    </div>
                    {!uploadingProfileImg && (
                      <Input
                        id="picture"
                        type="file"
                        onChange={handleImageUpload}
                        className="top-0 left-0 z-40 absolute opacity-0 rounded-full w-full h-full cursor-pointer"
                      />
                    )}
                  </div>
                )}
              </div>

              <h1 className="font-bold text-xl md:text-2xl">{user?.name}</h1>
            </div>
            <div className="right-2 bottom-2 z-40 absolute flex items-center gap-4 shadow-md custom-glow">
              <div className="relative flex justify-center items-center gap-2 bg-rose-500 hover:bg-rose-600 px-2 py-1 text-white text-sm">
                <CameraIcon />
                <span className="inline-block">Upload Cover Photo</span>
                <Input
                  type="file"
                  onChange={handleCoverChange}
                  className="absolute opacity-0 w-full h-full cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="items-start gap-3 grid lg:grid-cols-[34%_auto] md:grid-rows-[auto_auto] p-3 md:p-0 w-full">
            <Card className="p-4">
              <ul className="flex flex-col gap-3 overflow-x-hidden">
                <li>
                  <h1 className="font-semibold text-lg underline">Username</h1>
                  <p>@{user?.username}</p>
                </li>
                <li>
                  <h1 className="font-semibold text-lg underline">Email</h1>
                  <p className="overflow-hidden truncate text-ellipsis whitespace-nowrap">
                    {user?.email}
                  </p>
                </li>
                <li>
                  <h1 className="font-semibold text-lg underline">
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
                  <h1 className="font-semibold text-lg underline">Joined</h1>
                  <p>{formatHumanReadTimestamp(user?.createdAt as Date)}</p>
                </li>
              </ul>
            </Card>
            <div>
              <ul className="flex flex-col gap-3">
                {postsResult?.posts.map((post) => (
                  <PostCard key={post.id} post={post} userId={user!.id} />
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
