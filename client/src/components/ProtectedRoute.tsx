import { User } from "@/utility/types"
import React from "react"
import { Navigate, Outlet } from "react-router-dom"

type ProtectedRouteProps = {
  children?: React.ReactNode
  user: User | null
  redirect?: string
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  user,
  redirect = "/login",
}) => {
  if (!user) return <Navigate to={redirect} />

  return children ? children : <Outlet />
}

export default ProtectedRoute
