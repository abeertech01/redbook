import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  currentPage: 1,
}

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    updateCurrentPage: (state, action) => {
      state.currentPage = action.payload
    },
  },
})

export default postSlice
export const { updateCurrentPage } = postSlice.actions
