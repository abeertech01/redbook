import { userDoesntExist } from "@/app/reducers/user"
import { isAxiosError } from "@/lib/helper"
import axios from "axios"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

const useLogout = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  return async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_SERVER_URL}/api/user/logout`, {
        withCredentials: true,
      })

      dispatch(userDoesntExist())
      navigate("/login")
    } catch (error) {
      toast.error("Logout Error", {
        description: isAxiosError(error)
          ? error.response?.data.message
          : "Something went wrong",
      })
    }
  }
}

export default useLogout
