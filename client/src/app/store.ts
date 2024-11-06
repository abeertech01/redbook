import { configureStore } from "@reduxjs/toolkit"
import userSlice from "./reducers/user"
import postSlice from "./reducers/post"
import { postAPI } from "./api/post"
import { commentAPI } from "./api/comment"
import { userAPI } from "./api/user"
import { chatAPI } from "./api/chat"

const store = configureStore({
  reducer: {
    [userSlice.name]: userSlice.reducer,
    [postSlice.name]: postSlice.reducer,
    [userAPI.reducerPath]: userAPI.reducer,
    [postAPI.reducerPath]: postAPI.reducer,
    [commentAPI.reducerPath]: commentAPI.reducer,
    [chatAPI.reducerPath]: chatAPI.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(userAPI.middleware)
      .concat(postAPI.middleware)
      .concat(commentAPI.middleware)
      .concat(chatAPI.middleware),
  devTools: true,
})

export default store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
