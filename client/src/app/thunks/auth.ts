import { axiosConfig } from "@/constants/config"
import { isAxiosError } from "@/lib/helper"
import { AuthResult, LoginData, SignupData } from "@/utility/types"
import { createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"

export const loginUser = createAsyncThunk(
  "auth/login",
  async (formData: LoginData, { rejectWithValue }) => {
    try {
      const result = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/user/login`,
        formData,
        axiosConfig
      )

      return result.data as AuthResult
    } catch (error) {
      if (isAxiosError(error)) {
        return rejectWithValue(error.response.data.message)
      } else if (error instanceof Error) {
        return rejectWithValue(error.message)
      } else {
        return rejectWithValue("An unknown error occured!!")
      }
    }
  }
)

export const registerUser = createAsyncThunk(
  "auth/register",
  async (formData: SignupData, _) => {
    try {
      const result = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/user/register`,
        formData,
        axiosConfig
      )

      return result.data as AuthResult
    } catch (error) {
      if (isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "An error occurred"
        throw new Error(errorMessage)
      } else {
        throw new Error("An unknown error occurred")
      }
    }
  }
)
