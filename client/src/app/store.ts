import { configureStore } from "@reduxjs/toolkit"
import userSlice from "./reducers/user"
import miscSlice from "./reducers/misc"

const store = configureStore({
  reducer: {
    [userSlice.name]: userSlice.reducer,
    [miscSlice.name]: miscSlice.reducer,
  },
})

export default store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
