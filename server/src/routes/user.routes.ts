import express from "express"
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.controllers"

const router = express.Router()

router.post("/register", registerUser)
router.post("/login", loginUser)
router.delete("/logout", logoutUser)

export default router
