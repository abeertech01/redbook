import React from "react"
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
import { useDispatch } from "react-redux"
import { userDoesntExist } from "@/app/reducers/user"
import { useToast } from "@/hooks/use-toast"
import { isAxiosError } from "@/lib/helper"

type NavbarProps = {}

const Navbar: React.FC<NavbarProps> = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { toast } = useToast()

  const logout = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_SERVER_URL}/api/user/logout`, {
        withCredentials: true,
      })

      await dispatch(userDoesntExist())
      navigate("/login")
    } catch (error) {
      if (isAxiosError(error)) {
        toast({
          title: "Logout Error",
          description: error.response?.data.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Logout Error",
          description: "Something went wrong",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="bg-primary dark:bg-zinc-700 text-white py-2 px-5 flex justify-between items-center">
      <Link to={"/"}>
        <img src={logo} alt="Redbook Logo" className="w-[8rem]" />
      </Link>

      <div className="flex items-center gap-2 md:gap-5">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Link to={"/profile"}>My Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                variant="secondary"
                size="icon"
                className="bg-zinc-800 hover:bg-zinc-800 text-white hover:text-inherit focus-visible:outline-none"
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
