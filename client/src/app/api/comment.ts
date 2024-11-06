import {
  Comment,
  CommentResponse,
  CommentsResponse,
  CommentVotePayload,
  CreateCommentPayload,
} from "@/utility/types"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { RootState } from "../store"
import { downvoteCacheHelper, upvoteCacheHelper } from "@/lib/helper"

const commentAPI = createApi({
  reducerPath: "commentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_SERVER_URL}/api/post`,
    credentials: "include",
  }),
  tagTypes: ["Comments"],
  endpoints: (builder) => ({
    getComments: builder.query<CommentsResponse, string>({
      query: (postId) => ({
        url: `/${postId}/comments`,
        method: "GET",
      }),
      providesTags: ["Comments"],
    }),
    addComment: builder.mutation<CommentResponse, CreateCommentPayload>({
      query: ({ postId, content }) => ({
        url: `/${postId}/comments`,
        method: "POST",
        body: { content },
      }),
      invalidatesTags: ["Comments"],
    }),
    upvoteComment: builder.mutation<CommentResponse, CommentVotePayload>({
      query: ({ commentId }) => ({
        url: `/comments/${commentId}/upvote`,
        method: "PUT",
      }),
      async onQueryStarted(
        { commentId, postId },
        { dispatch, queryFulfilled, getState }
      ) {
        const state = getState() as RootState
        const authorId = state.user.user?.id as string

        const patchResult = dispatch(
          commentAPI.util.updateQueryData("getComments", postId, (draft) => {
            const comment = draft.comments.find(
              (comment) => comment.id === commentId
            ) as Comment

            upvoteCacheHelper<Comment>(comment, authorId)
          })
        )
        try {
          await queryFulfilled
        } catch (error) {
          patchResult.undo()
        }
      },
    }),
    downvoteComment: builder.mutation<CommentResponse, CommentVotePayload>({
      query: ({ commentId }) => ({
        url: `/comments/${commentId}/downvote`,
        method: "PUT",
      }),
      async onQueryStarted(
        { commentId, postId },
        { dispatch, queryFulfilled, getState }
      ) {
        const state = getState() as RootState
        const authorId = state.user.user?.id as string

        const patchResult = dispatch(
          commentAPI.util.updateQueryData("getComments", postId, (draft) => {
            const comment = draft.comments.find(
              (comment) => comment.id === commentId
            ) as Comment

            downvoteCacheHelper<Comment>(comment, authorId)
          })
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),
    deleteComment: builder.mutation<CommentResponse, string>({
      query: (commentId) => ({
        url: `/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Comments"],
    }),
  }),
})

export { commentAPI }
export const {
  useGetCommentsQuery,
  useAddCommentMutation,
  useUpvoteCommentMutation,
  useDownvoteCommentMutation,
  useDeleteCommentMutation,
} = commentAPI
