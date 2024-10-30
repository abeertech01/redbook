import { UserInitialStateType } from "@/utility/types"
import { createSlice } from "@reduxjs/toolkit"
import { loginUser, registerUser } from "../thunks/auth"

const initialState: UserInitialStateType = {
  user: null,
  loader: true,
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    userExists(state, action) {
      state.user = action.payload
      state.loader = false
    },
    userDoesntExist(state) {
      state.user = null
      state.loader = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loader = true
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loader = false
        state.user = action.payload.user
      })
      .addCase(registerUser.rejected, (state) => {
        state.loader = false
      })
      .addCase(loginUser.pending, (state) => {
        state.loader = true
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loader = false
        state.user = action.payload.user
      })
      .addCase(loginUser.rejected, (state) => {
        state.loader = false
      })
  },
})

export default userSlice
export const { userExists, userDoesntExist } = userSlice.actions
