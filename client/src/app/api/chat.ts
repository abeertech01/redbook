import { ChatsResponse, MessagesResponse, UserResponse } from "@/utility/types"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

interface GetMessagesArgs {
  chatId: string
  cursor?: string
}

const chatAPI = createApi({
  reducerPath: "chatAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_SERVER_URL}/api/chat`,
    credentials: "include",
  }),
  tagTypes: ["Chat"],
  endpoints: (builder) => ({
    getChats: builder.query<ChatsResponse, void>({
      query: () => ({
        url: "/get-chats",
        method: "GET",
      }),
    }),
    getMessages: builder.query<MessagesResponse, GetMessagesArgs>({
      query: ({ chatId, cursor }) => ({
        url: `/get-messages/${chatId}`,
        method: "GET",
        params: cursor ? { cursor } : undefined,
      }),
      // One cache entry per chat regardless of cursor, so pages accumulate
      // instead of each cursor creating its own separate cache entry.
      serializeQueryArgs: ({ queryArgs }) => queryArgs.chatId,
      merge: (currentCache, newData, { arg }) => {
        // No cursor means a fresh load of the chat (mount, or an explicit
        // refetch) - replace instead of prepending, or older pages the user
        // had already scrolled up to load would pile back on top of it.
        if (!arg.cursor) return newData

        currentCache.messages.unshift(...newData.messages)
        currentCache.hasMore = newData.hasMore
        currentCache.nextCursor = newData.nextCursor
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.cursor !== previousArg?.cursor,
      providesTags: ["Chat"],
    }),
    getChatParticipator: builder.query<UserResponse, string>({
      query: (chatId) => ({
        url: `/chat-participator/${chatId}`,
        method: "GET",
      }),
    }),
  }),
})

export { chatAPI }
export const {
  useGetChatsQuery,
  useGetMessagesQuery,
  useLazyGetMessagesQuery,
  useGetChatParticipatorQuery,
} = chatAPI
