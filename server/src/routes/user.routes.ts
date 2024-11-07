import express from "express"
import {
  updateBio,
  loginUser,
  logoutUser,
  registerUser,
  searchUser,
  userProfile,
  get10RandomUsers,
} from "../controllers/user.controllers"
import { isAuthenticated } from "../middlewares/auth"

const router = express.Router()

router.post("/register", registerUser)
router.post("/login", loginUser)

// Authorizing the user
router.use(isAuthenticated)

router.delete("/logout", logoutUser)
router.get("/profile", userProfile)
router.get("/search-user", searchUser)
router.put("/add-bio", updateBio)
router.get("/get-10-random-users", get10RandomUsers)

export default router
