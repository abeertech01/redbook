import { User } from "@/utility/types"
import React from "react"
import { Navigate, Outlet } from "react-router-dom"

type ProtectedRouteProps = {
  user: User | null
  redirect?: string
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  user,
  redirect = "/login",
}) => {
  if (!user) return <Navigate to={redirect} />

  return <Outlet />
}

export default ProtectedRoute
