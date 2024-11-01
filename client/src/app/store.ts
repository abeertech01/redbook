import { configureStore } from "@reduxjs/toolkit"
import userSlice from "./reducers/user"
import miscSlice from "./reducers/misc"
import { postAPI } from "./api/post"

const store = configureStore({
  reducer: {
    [userSlice.name]: userSlice.reducer,
    [miscSlice.name]: miscSlice.reducer,
    [postAPI.reducerPath]: postAPI.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(postAPI.middleware),
  devTools: true,
})

export default store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
