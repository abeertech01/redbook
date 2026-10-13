import { Post } from "@/utility/types"
import {
  useDownvotePostMutation,
  useUpvotePostMutation,
} from "@/app/api/post"
import { MessageSquare } from "lucide-react"
import { Link } from "react-router-dom"
import TimeAgo from "./TimeAgo"
import UserAvatar from "./UserAvatar"
import VoteControls from "./VoteControls"
import PostMenu from "./PostMenu"

type PostCardProps = {
  post: Post
  userId: string
  /** Profile lists only the viewer's own posts, so it drops the author row
   * and shows just the date above the title. */
  showAuthor?: boolean
  onDeleted?: () => void
}

const PostCard = ({ post, userId, showAuthor = true, onDeleted }: PostCardProps) => {
  const [upvotePost, { isLoading: uv_loading }] = useUpvotePostMutation()
  const [downvotePost, { isLoading: dv_loading }] = useDownvotePostMutation()
  const commentCount = post.comments?.length ?? 0

  return (
    <article className="flex flex-col gap-3 rounded-[18px] border border-line bg-surface px-5 py-4.5 hover:border-line-3">
      {showAuthor && (
        <div className="flex items-center gap-3">
          <UserAvatar user={post.author} className="size-9.5 text-[13px]" />
          <div className="min-w-0 flex-1">
            <div className="text-[14.5px] font-semibold">{post.author?.name}</div>
            <div className="text-[13px] text-mute-2">
              @{post.author?.username} ·{" "}
              <TimeAgo timestamp={post.createdAt} variant="date" />
            </div>
          </div>
          {post.authorId === userId && (
            <PostMenu postId={post.id} onDeleted={onDeleted} />
          )}
        </div>
      )}
      <Link to={`/post/${post.id}`} className="flex flex-col gap-1.5 text-ink">
        {!showAuthor && (
          <div className="text-[13px] text-mute-2">
            <TimeAgo timestamp={post.createdAt} variant="date" />
          </div>
        )}
        {post.title && (
          <h2 className="m-0 text-[19px] leading-[1.3] font-semibold tracking-[-0.01em] text-pretty">
            {post.title}
          </h2>
        )}
        <p className="m-0 text-[15px] leading-[1.55] whitespace-pre-line text-pretty text-ink-2">
          {post.content}
        </p>
      </Link>
      <div className="flex items-center gap-2 pt-1">
        <VoteControls
          upvoteIds={post.upvoteIds}
          downvoteIds={post.downvoteIds}
          userId={userId}
          onUpvote={() => upvotePost(post.id)}
          onDownvote={() => downvotePost(post.id)}
          disabled={uv_loading || dv_loading}
        />
        <Link
          to={`/post/${post.id}`}
          aria-label={`${commentCount} comments`}
          className="flex h-9 items-center gap-1.75 rounded-full border border-line-2 bg-chip px-3.5 text-[13.5px] font-semibold text-ink-3b hover:border-line-3 hover:text-ink"
        >
          <MessageSquare size={16} />
          {commentCount}
        </Link>
      </div>
    </article>
  )
}
export default PostCard
