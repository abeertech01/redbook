import React, { useEffect } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Login from "./pages/Login"
import Home from "./pages/Home"
import { Toaster } from "./components/ui/toaster"
import Post from "./pages/Post"
import Profile from "./pages/Profile"
import Messages from "./pages/Messages"
import Inbox from "./pages/Inbox"
import axios from "axios"

type AppProps = {}

const App: React.FC<AppProps> = () => {
  // const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_SERVER_URL}`, {
        withCredentials: true,
      })
      .then(({ data }) => console.log(data))
      .catch((_) => console.log("Unknown error occured!!"))
  }, [])

  // useEffect(() => {
  //   axios
  //     .get<AuthResult>(`${import.meta.env.VITE_SERVER_URL}/api/user/profile`, {
  //       withCredentials: true,
  //     })
  //     .then(({ data }) => dispatch(userExists(data.user)))
  //     .catch((_) => dispatch(userDoesntExist()))
  // }, [dispatch])

  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/messages" element={<Messages />}>
          <Route path=":chatId" element={<Inbox />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/post/:id" element={<Post />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App
