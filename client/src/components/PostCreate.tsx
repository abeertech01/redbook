import React, { useContext, useEffect, useState } from "react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { postAPI, useCreatePostMutation } from "@/app/api/post"
import { Input } from "./ui/input"
import { PgntPostsContext } from "@/pages/Home"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/app/store"
import { Post } from "@/utility/types"

type PostCreateProps = {}

const PostCreate: React.FC<PostCreateProps> = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const [postTitle, setPostTitle] = useState("")
  const [postText, setPostText] = useState("")
  const { currentPage } = useSelector((state: RootState) => state.post)
  const [createPost, { isSuccess, error: postCreateError }] =
    useCreatePostMutation()
  const { arePaginatedPosts } = useContext(PgntPostsContext)

  const handlePost = async () => {
    try {
      if (postTitle.length > 0 && postText.length > 0) {
        const { data: newPost } = await createPost({
          title: postTitle,
          content: postText,
        })

        setPostTitle("")
        setPostText("")

        if (newPost?.success && arePaginatedPosts) {
          console.log("as expected: entered")
          dispatch(
            postAPI.util.updateQueryData(
              "getPaginatedPosts",
              currentPage,
              (draft) => {
                draft.posts.unshift(newPost?.post as Post)
              }
            )
          )
        }
      } else {
        toast({
          title: "Post and its title both can't be empty",
          variant: "destructive",
        })
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({ title: error.message, variant: "destructive" })
      } else {
        toast({ title: "An unexpected error occurred", variant: "destructive" })
      }
    }
  }

  useEffect(() => {
    if (isSuccess) {
      toast({ title: "Post Created Successfully" })
    }
  }, [isSuccess, postCreateError])

  return (
    <Dialog>
      <DialogTrigger className="w-full">
        <Button
          variant={"outline"}
          size={"lg"}
          className="w-full flex justify-start"
        >
          Create A Post...
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col justify-center gap-3">
          <Input
            placeholder="Write a title"
            onChange={(e) => setPostTitle(e.target.value)}
            className="focus-visible:outline-none"
          />

          <Textarea
            rows={4}
            placeholder="Write what's on your mind..."
            onChange={(e) => setPostText(e.target.value)}
            className="focus-visible:outline-none"
          />
        </div>

        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={handlePost} variant="destructive">
              Save
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
export default PostCreate
