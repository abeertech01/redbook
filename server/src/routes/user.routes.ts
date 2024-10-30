import express from "express"
import {
  loginUser,
  logoutUser,
  registerUser,
  searchUser,
  userProfile,
} from "../controllers/user.controllers"
import { isAuthenticated } from "../middlewares/auth"

const router = express.Router()

router.post("/register", registerUser)
router.post("/login", loginUser)

//// Authorizing the user
router.use(isAuthenticated)

router.delete("/logout", logoutUser)
router.get("/profile", userProfile)
router.get("/search", searchUser)

export default router
