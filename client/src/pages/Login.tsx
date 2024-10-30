import React from "react"
import logo from "../assets/RedBook.svg"
import AuthTabs from "@/components/auth/AuthTabs"
import { useSelector } from "react-redux"
import { RootState } from "@/app/store"
import { Navigate } from "react-router-dom"
import ThemeToggle from "@/components/ThemeToggle"

type LoginProps = {}

const Login: React.FC<LoginProps> = () => {
  const { user } = useSelector((state: RootState) => state.user)

  if (user) return <Navigate to={"/"} />

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <img src={logo} alt="logo" className="w-48" />
      <AuthTabs />
    </div>
  )
}
export default Login
