import express from "express"
import {
  updateBio,
  loginUser,
  logoutUser,
  registerUser,
  searchUser,
  userProfile,
  get10RandomUsers,
  uploadProfileImage,
  uploadCoverImage,
} from "../controllers/user.controllers"
import { isAuthenticated } from "../middlewares/auth"
import fileParse from "../middlewares/formidableParse"

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
router.put("/upload-profile-image", fileParse, uploadProfileImage)
router.put("/upload-cover-image", fileParse, uploadCoverImage)

export default router
