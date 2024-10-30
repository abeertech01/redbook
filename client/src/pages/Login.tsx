import React from "react"
import logo from "../assets/RedBook.svg"
import AuthTabs from "@/components/auth/AuthTabs"

type LoginProps = {}

const Login: React.FC<LoginProps> = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5">
      <img src={logo} alt="logo" className="w-48" />
      <AuthTabs />
    </div>
  )
}
export default Login
