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
  tagTypes: ["Posts", "PaginatedPosts", "Post", "UserPosts"],
  endpoints: (builder) => ({
    getPosts: builder.query<FetchedPosts, void>({
      query: () => ({
        url: `/get-posts`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["Posts"],
    }),
    getUserPosts: builder.query<FetchedPosts, string>({
      query: (id) => ({
        url: `/get-user-posts/${id}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["UserPosts"],
    }),
    getPaginatedPosts: builder.query<FetchedPosts, number>({
      query: (page) => ({
        url: `/get-paginated-posts?page=${page}`,
        method: "GET",
        credentials: "include",
      }),
      keepUnusedDataFor: 60,
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName
      },
      merge: (currentCache, newItems) => {
        currentCache.posts.push(...newItems.posts)
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg
      },
      providesTags: ["PaginatedPosts"],
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
      invalidatesTags: ["PaginatedPosts", "UserPosts"],
    }),
    deletePost: builder.mutation<PostResponse, string>({
      query: (id) => ({
        url: `/delete-post/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["PaginatedPosts", "UserPosts"],
    }),
    upvotePost: builder.mutation<FetchedPost, string>({
      query: (postId) => ({
        url: `/upvote-post/${postId}`,
        method: "PUT",
        credentials: "include",
      }),
      async onQueryStarted(postId, { dispatch, queryFulfilled, getState }) {
        const state = getState() as RootState
        const authorId = state.user.user?.id as string
        const pageNumber = state.post.currentPage

        const patchResult_pgntPosts = dispatch(
          postAPI.util.updateQueryData(
            "getPaginatedPosts",
            pageNumber,
            (draft) => {
              const post = draft.posts.find(
                (post) => post.id === postId
              ) as Post

              upvoteCacheHelper<Post>(post, authorId)
            }
          )
        )

        const patchResult_usersPosts = dispatch(
          postAPI.util.updateQueryData("getUserPosts", authorId, (draft) => {
            const post = draft.posts.find((post) => post.id === postId) as Post

            if (post) upvoteCacheHelper<Post>(post, authorId)
          })
        )

        const patchResult_singlePosts = dispatch(
          postAPI.util.updateQueryData("getPost", postId, (draft) => {
            upvoteCacheHelper<Post>(draft.post, authorId)
          })
        )

        try {
          await queryFulfilled
        } catch {
          patchResult_pgntPosts.undo()
          patchResult_usersPosts.undo()
          patchResult_singlePosts.undo()
        }
      },
    }),
    downvotePost: builder.mutation<FetchedPost, string>({
      query: (postId) => ({
        url: `/downvote-post/${postId}`,
        method: "PUT",
        credentials: "include",
      }),
      async onQueryStarted(postId, { dispatch, queryFulfilled, getState }) {
        const state = getState() as RootState
        const authorId = state.user.user?.id as string
        const pageNumber = state.post.currentPage

        const patchResult_pgntPosts = dispatch(
          postAPI.util.updateQueryData(
            "getPaginatedPosts",
            pageNumber,
            (draft) => {
              const post = draft.posts.find(
                (post) => post.id === postId
              ) as Post

              downvoteCacheHelper<Post>(post, authorId)
            }
          )
        )

        const patchResult_usersPosts = dispatch(
          postAPI.util.updateQueryData("getUserPosts", authorId, (draft) => {
            const post = draft.posts.find((post) => post.id === postId) as Post

            if (post) downvoteCacheHelper<Post>(post, authorId)
          })
        )

        const patchResult_singlePosts = dispatch(
          postAPI.util.updateQueryData("getPost", postId, (draft) => {
            downvoteCacheHelper<Post>(draft.post, authorId)
          })
        )

        try {
          await queryFulfilled
        } catch {
          patchResult_pgntPosts.undo()
          patchResult_usersPosts.undo()
          patchResult_singlePosts.undo()
        }
      },
    }),
  }),
})

export { postAPI }
export const {
  useGetPostsQuery,
  useGetUserPostsQuery,
  useGetPaginatedPostsQuery,
  useGetPostQuery,
  useCreatePostMutation,
  useDeletePostMutation,
  useUpvotePostMutation,
  useDownvotePostMutation,
} = postAPI
