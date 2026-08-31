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
  tagTypes: ["Notifications", "UnreadCount"],
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationsResponse, void>({
      query: () => ({
        url: "/",
        method: "GET",
      }),
      providesTags: ["Notifications"],
    }),
    getUnreadCount: builder.query<UnreadCountResponse, void>({
      query: () => ({
        url: "/unread-count",
        method: "GET",
      }),
      providesTags: ["UnreadCount"],
    }),
    markAsRead: builder.mutation<NotificationMutationResponse, string>({
      query: (id) => ({
        url: `/${id}/read`,
        method: "PUT",
      }),
      invalidatesTags: ["Notifications", "UnreadCount"],
    }),
    markAllAsRead: builder.mutation<NotificationMutationResponse, void>({
      query: () => ({
        url: "/read-all",
        method: "PUT",
      }),
      invalidatesTags: ["Notifications", "UnreadCount"],
    }),
  }),
})

export { notificationAPI }
export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationAPI
