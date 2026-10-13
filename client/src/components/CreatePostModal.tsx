import { postAPI, useCreatePostMutation } from "@/app/api/post"
import { AppDispatch, RootState } from "@/app/store"
import { cn } from "@/lib/utils"
import { Post } from "@/utility/types"
import { Globe, X } from "lucide-react"
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "sonner"
import UserAvatar from "./UserAvatar"

type CreatePostModalProps = {
  open: boolean
  onClose: () => void
  /** Phones get a bottom sheet instead of a centered dialog. */
  mobile: boolean
}

const CreatePostModal = ({ open, onClose, mobile }: CreatePostModalProps) => {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.user)
  const { currentPage } = useSelector((state: RootState) => state.post)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [createPost, { isLoading }] = useCreatePostMutation()

  // The server requires both a title and a body.
  const canPost = title.trim().length > 0 && content.trim().length > 0 && !isLoading

  const handlePost = async () => {
    if (!canPost) return

    const result = await createPost({ title: title.trim(), content: content.trim() })

    if ("error" in result) {
      toast.error("Couldn't create the post")
      return
    }

    // No-op when the feed hasn't been loaded yet - it'll fetch fresh anyway.
    dispatch(
      postAPI.util.updateQueryData("getPaginatedPosts", currentPage, (draft) => {
        draft.posts.unshift(result.data.post as Post)
      })
    )

    setTitle("")
    setContent("")
    onClose()
    toast("Post created")
  }

  if (!open) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 grid",
        mobile ? "items-end justify-items-center p-0" : "place-items-center p-5"
      )}
    >
      <div
        onClick={onClose}
        className="absolute inset-0 bg-backdrop backdrop-blur-md"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Create post"
        className={cn(
          "relative flex w-full max-w-145 flex-col overflow-hidden border border-line-2 bg-pop shadow-[0_40px_100px_var(--shade)]",
          mobile ? "mx-auto rounded-t-[22px]" : "rounded-[22px]"
        )}
      >
        <div className="flex items-center justify-between border-b border-line pt-4.5 pr-5 pb-3.5 pl-6">
          <div className="text-[17px] font-semibold tracking-[-0.01em]">Create post</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-8.5 cursor-pointer place-items-center rounded-full text-ink-3b hover:bg-hover-2 hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex flex-col gap-3.5 px-6 pt-5 pb-2">
          <div className="flex items-center gap-3">
            <UserAvatar user={user} className="size-10.5 text-sm" />
            <div className="min-w-0">
              <div className="text-[14.5px] font-semibold">{user?.name}</div>
              <div className="flex items-center gap-1.5 text-[12.5px] text-mute">
                <Globe size={12} />
                Public
              </div>
            </div>
          </div>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give it a title"
            maxLength={120}
            className="w-full bg-transparent py-1 text-[22px] font-semibold tracking-[-0.015em] text-ink outline-none"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            placeholder="What's on your mind?"
            className="min-h-37.5 w-full resize-none bg-transparent p-0 text-base leading-[1.6] text-ink-2 outline-none"
          />
        </div>
        <div className="flex items-center gap-3 border-t border-line pt-3.5 pr-5 pb-4.5 pl-6">
          <span className="font-mono text-xs text-faint">
            {content.length} characters
          </span>
          <span className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            className="h-10 cursor-pointer rounded-full px-4.5 text-sm font-semibold text-ink-3b hover:bg-hover-2 hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePost}
            disabled={!canPost}
            className={cn(
              "h-10 rounded-full px-5.5 text-sm font-semibold",
              canPost
                ? "cursor-pointer bg-brand text-white hover:bg-brand-hover"
                : "bg-line text-faint"
            )}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreatePostModal
