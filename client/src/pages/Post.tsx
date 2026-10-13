import { useAddCommentMutation, useGetCommentsQuery } from "@/app/api/comment"
import {
  useDownvotePostMutation,
  useGetPostQuery,
  useUpvotePostMutation,
} from "@/app/api/post"
import { RootState } from "@/app/store"
import Comments from "@/components/Comments"
import PostMenu from "@/components/PostMenu"
import TimeAgo from "@/components/TimeAgo"
import UserAvatar from "@/components/UserAvatar"
import VoteControls from "@/components/VoteControls"
import { cn } from "@/lib/utils"
import { ArrowLeft, MessageSquare } from "lucide-react"
import { useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

const Post = () => {
  const [commentText, setCommentText] = useState("")
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useSelector((state: RootState) => state.user)
  const { data } = useGetPostQuery(id as string)
  const { data: commentsData } = useGetCommentsQuery(id as string)
  const [addComment, { isLoading: addCommentLoading }] = useAddCommentMutation()
  const [upvotePost, { isLoading: uv_loading }] = useUpvotePostMutation()
  const [downvotePost, { isLoading: dv_loading }] = useDownvotePostMutation()

  const post = data?.post
  const commentCount = commentsData?.comments.length ?? 0
  const canComment = commentText.trim().length > 0 && !addCommentLoading

  const submitComment = async () => {
    if (!canComment) return

    const result = await addComment({
      postId: id as string,
      content: commentText.trim(),
    })

    if ("error" in result) {
      toast.error("Couldn't add the comment")
      return
    }

    setCommentText("")
  }

  return (
    <>
      <button
        type="button"
        onClick={() => navigate("/")}
        className="flex h-9 cursor-pointer items-center gap-2 self-start rounded-full pr-3.5 pl-2.5 text-sm font-medium text-ink-3b hover:bg-hover hover:text-ink"
      >
        <ArrowLeft size={17} />
        Back to feed
      </button>

      {post && (
        <article className="flex flex-col gap-4 rounded-[20px] border border-line bg-surface px-5 py-5 sm:px-7 sm:py-6.5">
          <div className="flex items-center gap-3">
            <UserAvatar user={post.author} className="size-11 text-sm" />
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold">{post.author?.name}</div>
              <div className="text-[13px] text-mute-2">
                @{post.author?.username} ·{" "}
                <TimeAgo timestamp={post.createdAt} variant="date" />
              </div>
            </div>
            {post.authorId === user?.id && (
              <PostMenu postId={post.id} onDeleted={() => navigate("/")} />
            )}
          </div>
          {post.title && (
            <h1 className="m-0 text-[28px] leading-[1.2] font-semibold tracking-[-0.02em] text-pretty">
              {post.title}
            </h1>
          )}
          <p className="m-0 text-[16.5px] leading-[1.6] whitespace-pre-line text-pretty text-ink-2">
            {post.content}
          </p>
          <div className="flex items-center gap-2 pt-1.5">
            <VoteControls
              size="lg"
              upvoteIds={post.upvoteIds}
              downvoteIds={post.downvoteIds}
              userId={user!.id}
              onUpvote={() => upvotePost(post.id)}
              onDownvote={() => downvotePost(post.id)}
              disabled={uv_loading || dv_loading}
            />
            <div className="flex h-9.5 items-center gap-1.75 px-3.5 text-sm font-semibold text-ink-3b">
              <MessageSquare size={16} />
              {commentCount === 1 ? "1 comment" : `${commentCount} comments`}
            </div>
          </div>
        </article>
      )}

      <div className="flex gap-3.5 rounded-[20px] border border-line bg-surface px-4 py-4 sm:px-6 sm:py-5">
        <UserAvatar user={user} className="size-9.5 text-[13px]" />
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={3}
            placeholder="Add a comment…"
            className="w-full resize-y rounded-xl border border-line-2 bg-field px-3.5 py-3 text-[15px] leading-normal text-ink outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(255,51,88,0.18)]"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={submitComment}
              disabled={!canComment}
              className={cn(
                "h-9 rounded-full px-4.5 text-sm font-semibold",
                canComment
                  ? "cursor-pointer bg-brand text-white hover:bg-brand-hover"
                  : "bg-line text-faint"
              )}
            >
              Comment
            </button>
          </div>
        </div>
      </div>

      {post && <Comments postId={post.id} userId={user!.id} />}
    </>
  )
}
export default Post
