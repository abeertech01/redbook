import React from "react"
import PostCard from "./PostCard"
import { useGetPaginatedPostsQuery } from "@/app/api/post"
import { Post } from "@/utility/types"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/app/store"
import { updateCurrentPage } from "@/app/reducers/post"

type AllPostsProps = {
  userId: string
}

const AllPosts: React.FC<AllPostsProps> = ({ userId }) => {
  const dispatch = useDispatch<AppDispatch>()
  // const { data, isLoading } = useGetPostsQuery()
  const { currentPage } = useSelector((state: RootState) => state.post)
  const { data, isFetching } = useGetPaginatedPostsQuery(currentPage)

  const scrollHandler = (e: React.UIEvent<HTMLElement>) => {
    const scrolledToBottom =
      e.currentTarget.scrollTop + e.currentTarget.clientHeight >=
      e.currentTarget.scrollHeight - 1

    if (scrolledToBottom && !isFetching) {
      dispatch(updateCurrentPage(currentPage + 1))
    }
  }

  return (
    <div
      onScroll={scrollHandler}
      className="flex flex-col gap-4 w-full h-full overflow-y-scroll scrollbar scrollbar-thumb-secondary scrollbar-track-transparent box-border pr-3"
    >
      {data?.posts?.map((post, index) => (
        <PostCard key={index} post={post as Post} userId={userId!} />
      ))}
      {isFetching && <p>Loading for more...</p>}
    </div>
  )
}
export default AllPosts
