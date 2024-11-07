import { UserResponse, UsersResponse } from "@/utility/types"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

const userAPI = createApi({
  reducerPath: "userAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_SERVER_URL}/api/user`,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    searchUsers: builder.query<UsersResponse, string>({
      query: (name) => `/search-user?name=${name}`,
    }),
    updateBio: builder.mutation<UserResponse, string>({
      query: (bio) => ({
        url: "/add-bio",
        method: "PUT",
        body: { bio },
      }),
    }),
    get10RandomUsers: builder.query<UsersResponse, void>({
      query: () => "/get-10-random-users",
    }),
  }),
})

export { userAPI }
export const {
  useLazySearchUsersQuery,
  useUpdateBioMutation,
  useGet10RandomUsersQuery,
} = userAPI
