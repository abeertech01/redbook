import { ChatsResponse, MessagesResponse, UserResponse } from "@/utility/types"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

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
    getMessages: builder.query<MessagesResponse, string>({
      query: (chatId) => ({
        url: `/get-messages/${chatId}`,
        method: "GET",
      }),
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
  useGetChatParticipatorQuery,
} = chatAPI
