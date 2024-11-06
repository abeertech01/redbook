import { UsersResponse } from "@/utility/types"
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
  }),
})

export { userAPI }
export const { useLazySearchUsersQuery } = userAPI
