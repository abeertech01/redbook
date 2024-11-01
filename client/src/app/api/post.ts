import {
  CreatePostReqBody,
  FetchedPost,
  FetchedPosts,
  Post,
  PostResponse,
} from "@/utility/types"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { RootState } from "../store"
import { downvoteCacheHelper, upvoteCacheHelper } from "@/lib/helper"

const postAPI = createApi({
  reducerPath: "postApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_SERVER_URL}/api/post`,
  }),
  tagTypes: ["Posts", "Post"],
  endpoints: (builder) => ({
    getPosts: builder.query<FetchedPosts, void>({
      query: () => ({
        url: `/get-posts`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["Posts"],
    }),
    getPost: builder.query<FetchedPost, string>({
      query: (id) => ({
        url: `/get-post/${id}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["Post"],
    }),
    createPost: builder.mutation<PostResponse, CreatePostReqBody>({
      query: (body) => ({
        url: `/create-post`,
        method: "POST",
        body,
        credentials: "include",
      }),
      invalidatesTags: ["Posts"],
    }),
    deletePost: builder.mutation<PostResponse, string>({
      query: (id) => ({
        url: `/delete-post/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["Posts"],
    }),
    upvotePost: builder.mutation<FetchedPost, string>({
      query: (id) => ({
        url: `/upvote-post/${id}`,
        method: "PUT",
        credentials: "include",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const state = getState() as RootState
        const authorId = state.user.user?.id as string

        const patchResult = dispatch(
          postAPI.util.updateQueryData("getPosts", undefined, (draft) => {
            const post = draft.posts.find((post) => post.id === id) as Post

            upvoteCacheHelper(post, authorId)
          })
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),
    downvotePost: builder.mutation<FetchedPost, string>({
      query: (id) => ({
        url: `/downvote-post/${id}`,
        method: "PUT",
        credentials: "include",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const state = getState() as RootState
        const authorId = state.user.user?.id as string

        const patchResult = dispatch(
          postAPI.util.updateQueryData("getPosts", undefined, (draft) => {
            const post = draft.posts.find((post) => post.id === id) as Post

            downvoteCacheHelper(post, authorId)
          })
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),
  }),
})

export { postAPI }
export const {
  useGetPostsQuery,
  useGetPostQuery,
  useCreatePostMutation,
  useDeletePostMutation,
  useUpvotePostMutation,
  useDownvotePostMutation,
} = postAPI
