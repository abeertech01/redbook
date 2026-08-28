import { Link, useNavigate } from "react-router-dom"
import logo from "@/assets/RedBook.svg"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import ThemeToggle from "./ThemeToggle"
import { Menu } from "lucide-react"
import { Button } from "./ui/button"
import axios from "axios"
import { useDispatch, useSelector } from "react-redux"
import { userDoesntExist } from "@/app/reducers/user"
import { toast } from "sonner"
import { isAxiosError } from "@/lib/helper"
import { RootState } from "@/app/store"

const Navbar = () => {
  const { user } = useSelector((state: RootState) => state.user)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const logout = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_SERVER_URL}/api/user/logout`, {
        withCredentials: true,
      })

      await dispatch(userDoesntExist())
      navigate("/login")
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error("Logout Error", {
          description: error.response?.data.message,
        })
      } else {
        toast.error("Logout Error", {
          description: "Something went wrong",
        })
      }
    }
  }

  return (
    <div className="flex justify-between items-center bg-primary dark:bg-zinc-700 px-5 py-2 text-white">
      <Link to={"/"}>
        <img src={logo} alt="Redbook Logo" className="w-32" />
      </Link>

      <div className="flex items-center gap-2 md:gap-5">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src={user?.profileImgUrl} className="object-cover" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => navigate("/profile")}
              className="cursor-pointer"
            >
              My Profile
            </DropdownMenuItem>
            <DropdownMenuItem disabled>Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="bg-zinc-800 hover:bg-zinc-800 focus-visible:outline-none text-white hover:text-inherit"
              >
                <Menu />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem>Team</DropdownMenuItem>
              <DropdownMenuItem>Subscription</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
export default Navbar
