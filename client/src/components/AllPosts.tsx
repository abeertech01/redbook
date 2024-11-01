import React from "react"
import PostCard from "./PostCard"
import { useGetPostsQuery } from "@/app/api/post"
import LayoutLoader from "./LayoutLoader"
import { Post } from "@/utility/types"

type AllPostsProps = {}

const AllPosts: React.FC<AllPostsProps> = () => {
  const { data, isLoading } = useGetPostsQuery()

  return (
    <div className="flex flex-col gap-4 w-full">
      {isLoading ? (
        <div className="flex justify-center items-center">
          <LayoutLoader />
        </div>
      ) : (
        data?.posts?.map((post) => (
          <PostCard key={post.id} post={post as Post} />
        ))
      )}
    </div>
  )
}
export default AllPosts