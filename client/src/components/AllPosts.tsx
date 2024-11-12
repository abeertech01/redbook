import React, { useContext, useEffect } from "react"
import PostCard from "./PostCard"
import { useGetPaginatedPostsQuery } from "@/app/api/post"
import { Post } from "@/utility/types"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/app/store"
import { updateCurrentPage } from "@/app/reducers/post"
import { PgntPostsContext } from "@/pages/Home"

type AllPostsProps = {
  userId: string
}

const AllPosts: React.FC<AllPostsProps> = ({ userId }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { currentPage } = useSelector((state: RootState) => state.post)
  const { data, isFetching } = useGetPaginatedPostsQuery(currentPage)
  const { setArePaginatedPosts } = useContext(PgntPostsContext)

  const scrollHandler = (e: React.UIEvent<HTMLElement>) => {
    const scrolledToBottom =
      e.currentTarget.scrollTop + e.currentTarget.clientHeight >=
      e.currentTarget.scrollHeight - 1

    if (scrolledToBottom && !isFetching) {
      dispatch(updateCurrentPage(currentPage + 1))
    }
  }

  useEffect(() => {
    if (data?.posts.length! > 0) {
      setArePaginatedPosts(true)
    }
  }, [data, setArePaginatedPosts])

  return (
    <div
      onScroll={scrollHandler}
      className="flex flex-col gap-4 w-full h-full pr-[0.93rem] overflow-y-scroll scrollbar scrollbar-thumb-secondary scrollbar-track-transparent box-border"
    >
      {data?.posts?.map((post, index) => (
        <PostCard key={index} post={post as Post} userId={userId!} />
      ))}
      {isFetching && <p>Loading for more...</p>}
    </div>
  )
}
export default AllPosts
