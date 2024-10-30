export interface UserInitialStateType {
  user: User | null
  loader: boolean
}

export interface User {
  id: string
  name: string
  username: string
  email: string
  createdAt: Date
  updatedAt: Date
}

export interface AuthResult {
  success: boolean
  message: string
  user: User
}

export interface LoginData {
  userAddress: string
  password: string
}

export interface SignupData {
  name: string
  username: string
  email: string
  password: string
}

export interface AxiosError {
  response: {
    data: {
      message: string
    }
  }
}
