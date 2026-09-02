import {
  NotificationMutationResponse,
  NotificationsResponse,
  UnreadCountResponse,
} from "@/utility/types"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

const notificationAPI = createApi({
  reducerPath: "notificationAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_SERVER_URL}/api/notification`,
    credentials: "include",
  }),
  tagTypes: ["Notifications", "UnreadCount", "UnreadMessageCount"],
  endpoints: (builder) => ({
    // Arg is the cursor, so an undefined arg means "first page" - which
    // also keeps SocketProvider's updateQueryData(..., undefined, ...) call
    // addressing this same entry.
    getNotifications: builder.query<NotificationsResponse, string | undefined>({
      query: (cursor) => ({
        url: "/",
        method: "GET",
        params: cursor ? { cursor } : undefined,
      }),
      // One cache entry for the whole list regardless of cursor, so pages
      // accumulate instead of each cursor getting its own entry.
      serializeQueryArgs: () => "list",
      merge: (currentCache, newData, { arg }) => {
        // No cursor means a fresh load (dropdown opened, or a refetch after
        // mark-as-read invalidated the tag) - replace, or previously loaded
        // pages would be duplicated underneath the new first page.
        if (!arg) return newData

        // Newest-first list, so an older page appends to the end.
        currentCache.notifications.push(...newData.notifications)
        currentCache.hasMore = newData.hasMore
        currentCache.nextCursor = newData.nextCursor
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg !== previousArg,
      providesTags: ["Notifications"],
    }),
    getUnreadCount: builder.query<UnreadCountResponse, void>({
      query: () => ({
        url: "/unread-count",
        method: "GET",
      }),
      providesTags: ["UnreadCount"],
    }),
    getUnreadMessageCount: builder.query<UnreadCountResponse, void>({
      query: () => ({
        url: "/unread-message-count",
        method: "GET",
      }),
      providesTags: ["UnreadMessageCount"],
    }),
    markAsRead: builder.mutation<NotificationMutationResponse, string>({
      query: (id) => ({
        url: `/${id}/read`,
        method: "PUT",
      }),
      invalidatesTags: ["Notifications", "UnreadCount", "UnreadMessageCount"],
    }),
    markAllAsRead: builder.mutation<NotificationMutationResponse, void>({
      query: () => ({
        url: "/read-all",
        method: "PUT",
      }),
      invalidatesTags: ["Notifications", "UnreadCount", "UnreadMessageCount"],
    }),
    markChatNotificationsAsRead: builder.mutation<
      NotificationMutationResponse,
      string
    >({
      query: (chatId) => ({
        url: `/chat/${chatId}/read`,
        method: "PUT",
      }),
      invalidatesTags: ["Notifications", "UnreadCount", "UnreadMessageCount"],
    }),
  }),
})

export { notificationAPI }
export const {
  useGetNotificationsQuery,
  useLazyGetNotificationsQuery,
  useGetUnreadCountQuery,
  useGetUnreadMessageCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useMarkChatNotificationsAsReadMutation,
} = notificationAPI
