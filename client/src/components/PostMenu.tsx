import { useDeletePostMutation } from "@/app/api/post"
import { Ellipsis, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

type PostMenuProps = {
  postId: string
  onDeleted?: () => void
}

// Only rendered for the viewer's own posts - delete is the one action the
// "..." menu has.
const PostMenu = ({ postId, onDeleted }: PostMenuProps) => {
  const [deletePost, { isLoading }] = useDeletePostMutation()

  const handleDelete = async () => {
    const result = await deletePost(postId)

    if (result.data?.success) {
      toast("Post deleted")
      onDeleted?.()
    } else {
      toast.error("Couldn't delete the post")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Post options"
          className="grid size-8 cursor-pointer place-items-center rounded-full text-mute-2 outline-none hover:bg-hover-2 hover:text-ink data-[state=open]:bg-hover-2"
        >
          <Ellipsis size={18} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl p-1.5">
        <DropdownMenuItem
          disabled={isLoading}
          onSelect={handleDelete}
          className="cursor-pointer gap-2 rounded-lg px-2.5 py-2 text-accent-text focus:bg-hover-2 focus:text-accent-text"
        >
          <Trash2 size={15} />
          Delete post
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default PostMenu
