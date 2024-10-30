import express from "express"
import {
  createPost,
  deletePost,
  getPost,
  getPosts,
  getUserPosts,
} from "../controllers/post.controllers"
import { isAuthenticated } from "../middlewares/auth"

const router = express.Router()

// Authorizing the user
router.use(isAuthenticated)

router.post("/create-post", createPost)
router.get("/get-posts", getPosts)
router.get("/get-user-posts/:id", getUserPosts)
router.get("/get-post/:id", getPost)
router.delete("/delete-post/:id", deletePost)

export default router
