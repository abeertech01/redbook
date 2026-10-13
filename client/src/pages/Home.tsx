import { postAPI, useGetPaginatedPostsQuery } from "@/app/api/post"
import { updateCurrentPage } from "@/app/reducers/post"
import { AppDispatch, RootState } from "@/app/store"
import { useAppShell } from "@/components/layout/AppShellContext"
import PostCard from "@/components/PostCard"
import UserAvatar from "@/components/UserAvatar"
import { useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"

// Matches the server's default `limit` for /get-paginated-posts.
const PAGE_SIZE = 10

const Home = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.user)
  const { currentPage } = useSelector((state: RootState) => state.post)
  const { data, isFetching } = useGetPaginatedPostsQuery(currentPage)
  const { openCreatePost } = useAppShell()
  const sentinelRef = useRef<HTMLDivElement>(null)

  const posts = data?.posts ?? []
  // Pages accumulate in one cache entry, so a short total means the last
  // page came back less than full and there's nothing further to ask for.
  const hasMore = posts.length >= currentPage * PAGE_SIZE

  // The feed scrolls with the page now, so load the next page when a
  // sentinel under the last post comes into view.
  useEffect(() => {
    const el = sentinelRef.current
    if (!el || isFetching || !hasMore) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) dispatch(updateCurrentPage(currentPage + 1))
      },
      { rootMargin: "400px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [dispatch, currentPage, isFetching, hasMore])

  const removeFromFeed = (postId: string) =>
    dispatch(
      postAPI.util.updateQueryData("getPaginatedPosts", currentPage, (draft) => {
        draft.posts = draft.posts.filter((post) => post.id !== postId)
      })
    )

  const firstName = user?.name.split(" ")[0]

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={openCreatePost}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openCreatePost()}
        className="flex cursor-pointer items-center gap-3.5 rounded-[18px] border border-line bg-surface px-4 py-3.5 hover:border-line-3"
      >
        <UserAvatar user={user} className="size-10 text-sm" />
        <div className="flex h-10.5 min-w-0 flex-1 items-center truncate rounded-full border border-line-2 bg-field px-4 text-[15px] text-mute-2">
          What's on your mind, {firstName}?
        </div>
        <span className="flex h-10 flex-none items-center rounded-full bg-brand px-4.5 text-sm font-semibold text-white hover:bg-brand-hover">
          Post
        </span>
      </div>

      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          userId={user!.id}
          onDeleted={() => removeFromFeed(post.id)}
        />
      ))}

      <div ref={sentinelRef} />
      {isFetching && (
        <p className="py-2 text-center text-sm text-mute">Loading more posts...</p>
      )}
    </>
  )
}
export default Home
