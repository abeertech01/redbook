import React from "react"
import PostCard from "./PostCard"
import { useGetPostsQuery } from "@/app/api/post"
import LayoutLoader from "./LayoutLoader"
import { Post } from "@/utility/types"

type AllPostsProps = {
  userId: string
}

const AllPosts: React.FC<AllPostsProps> = ({ userId }) => {
  const { data, isLoading } = useGetPostsQuery()

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      {isLoading ? (
        <div className="w-full h-full flex justify-center items-center">
          <LayoutLoader />
        </div>
      ) : (
        data?.posts?.map((post) => (
          <PostCard key={post.id} post={post as Post} userId={userId!} />
        ))
      )}
    </div>
  )
}
export default AllPosts
