import React, { useEffect, useState } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Login from "./pages/Login"
import Home from "./pages/Home"
import { Toaster } from "./components/ui/toaster"
import Post from "./pages/Post"
import Profile from "./pages/Profile"
import Messages from "./pages/Messages"
import Inbox from "./pages/Inbox"
import axios from "axios"
import { AuthResult, User } from "./utility/types"
import { userDoesntExist, userExists } from "./app/reducers/user"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "./app/store"
import ProtectedRoute from "./components/ProtectedRoute"

type AppProps = {}

const App: React.FC<AppProps> = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { loader } = useSelector((state: RootState) => state.user)
  const [fetchedUser, setFetchedUser] = useState<User | null>()

  useEffect(() => {
    axios
      .get<AuthResult>(`${import.meta.env.VITE_SERVER_URL}/api/user/profile`, {
        withCredentials: true,
      })
      .then(({ data }) => {
        if (data) {
          setFetchedUser(data.user)
          dispatch(userExists(data.user))
        }
      })
      .catch((_) => dispatch(userDoesntExist()))
  }, [dispatch])

  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route element={<ProtectedRoute user={fetchedUser as User} />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/messages" element={<Messages />}>
            <Route path=":chatId" element={<Inbox />} />
          </Route>
          <Route path="/post/:id" element={<Post />} />
        </Route>

        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App
