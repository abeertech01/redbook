import { configureStore } from "@reduxjs/toolkit"
import userSlice from "./reducers/user"
import miscSlice from "./reducers/misc"
import { postAPI } from "./api/post"
import { commentAPI } from "./api/comment"

const store = configureStore({
  reducer: {
    [userSlice.name]: userSlice.reducer,
    [miscSlice.name]: miscSlice.reducer,
    [postAPI.reducerPath]: postAPI.reducer,
    [commentAPI.reducerPath]: commentAPI.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(postAPI.middleware)
      .concat(commentAPI.middleware),
  devTools: true,
})

export default store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
