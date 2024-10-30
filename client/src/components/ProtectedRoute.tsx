import { User } from "@/utility/types"
import React from "react"

type ProtectedRouteProps = {
  user: User | null
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ user }) => {
  return <div>{user?.name}</div>
}
export default ProtectedRoute
