import {
  CreatePostReqBody,
  FetchedPost,
  FetchedPosts,
  Post,
  PostResponse,
  User,
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
      async onQueryStarted(body, { dispatch, queryFulfilled, getState }) {
        const state = getState() as RootState
        const authorId = state.user.user?.id as string

        const patchResult = dispatch(
          postAPI.util.updateQueryData("getPaginatedPosts", 1, (draft) => {
            draft.posts.unshift({
              id: crypto.randomUUID(),
              createdAt: new Date(),
              updatedAt: new Date(),
              title: body.title,
              content: body.content,
              upvoteIds: [],
              downvoteIds: [],
              authorId,
              author: state.user.user as User,
              comments: [],
            })
          })
        )

        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
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
      query: (id) => ({
        url: `/upvote-post/${id}`,
        method: "PUT",
        credentials: "include",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const state = getState() as RootState
        const authorId = state.user.user?.id as string
        const pageNumber = state.post.currentPage

        const patchResult = dispatch(
          postAPI.util.updateQueryData(
            "getPaginatedPosts",
            pageNumber,
            (draft) => {
              const post = draft.posts.find((post) => post.id === id) as Post

              upvoteCacheHelper<Post>(post, authorId)
            }
          )
        )

        const patchResult_UserPosts = dispatch(
          postAPI.util.updateQueryData("getUserPosts", authorId, (draft) => {
            const post = draft.posts.find((post) => post.id === id) as Post

            upvoteCacheHelper<Post>(post, authorId)
          })
        )

        const patchSinglePostResult = dispatch(
          postAPI.util.updateQueryData("getPost", id, (draft) => {
            upvoteCacheHelper<Post>(draft.post, authorId)
          })
        )

        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
          patchResult_UserPosts.undo()
          patchSinglePostResult.undo()
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
        const pageNumber = state.post.currentPage

        const patchResult = dispatch(
          postAPI.util.updateQueryData(
            "getPaginatedPosts",
            pageNumber,
            (draft) => {
              const post = draft.posts.find((post) => post.id === id) as Post

              downvoteCacheHelper<Post>(post, authorId)
            }
          )
        )

        const patchResult_UserPosts = dispatch(
          postAPI.util.updateQueryData("getUserPosts", authorId, (draft) => {
            const post = draft.posts.find((post) => post.id === id) as Post

            downvoteCacheHelper<Post>(post, authorId)
          })
        )

        const patchSinglePostPatch = dispatch(
          postAPI.util.updateQueryData("getPost", id, (draft) => {
            downvoteCacheHelper<Post>(draft.post, authorId)
          })
        )

        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
          patchResult_UserPosts.undo()
          patchSinglePostPatch.undo()
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
