import React from "react"
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

type PostCreateProps = {}

const PostCreate: React.FC<PostCreateProps> = () => {
  const handleSubmit = () => {
    console.log("submitted")
  }
  return (
    <Dialog>
      <DialogTrigger className="w-full pr-3">
        <Button
          variant={"outline"}
          size={"lg"}
          className="w-full flex justify-start"
        >
          Create A Post...
        </Button>
      </DialogTrigger>
      <DialogContent onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <Textarea
            rows={4}
            placeholder="Write what's on your mind..."
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
            <Button type="submit" variant="destructive">
              Save
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
export default PostCreate
