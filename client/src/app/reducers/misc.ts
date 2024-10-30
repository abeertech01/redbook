import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  logging: false,
  registering: false,
}

const miscSlice = createSlice({
  name: "misc",
  initialState,
  reducers: {
    changeLogging(state, action) {
      state.logging = action.payload
    },
    changeRegistering(state, action) {
      state.registering = action.payload
    },
  },
})

export default miscSlice
export const { changeLogging, changeRegistering } = miscSlice.actions
