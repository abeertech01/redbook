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
    updateBio(state, action) {
      state.user!.bio = action.payload
    },
    updateProfileImageUrl(state, action) {
      state.user!.profileImgUrl = action.payload
    },
    updateCoverImageUrl(state, action) {
      state.user!.coverImgUrl = action.payload
    },
  },
  // `loader` is only for the initial session check in App. Login/register
  // deliberately don't touch it: App swaps the whole router for a spinner
  // while it's set, which would unmount the auth form mid-submit and lose
  // its error message. The form tracks its own submitting state instead.
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload.user
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user
      })
  },
})

export default userSlice
export const {
  userExists,
  userDoesntExist,
  updateBio,
  updateProfileImageUrl,
  updateCoverImageUrl,
} = userSlice.actions
