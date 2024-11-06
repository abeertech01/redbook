import express from "express"
import {
  addComment,
  createPost,
  deleteComment,
  deletePost,
  downvoteComment,
  downvotePost,
  getComments,
  getPaginatedPosts,
  getPost,
  getPosts,
  getUserPosts,
  upvoteComment,
  upvotePost,
} from "../controllers/post.controllers"
import { isAuthenticated } from "../middlewares/auth"

const router = express.Router()

// Authorizing the user
router.use(isAuthenticated)

router.post("/create-post", createPost)
router.get("/get-posts", getPosts)
router.get("/get-paginated-posts", getPaginatedPosts)
router.get("/get-user-posts/:id", getUserPosts)
router.get("/get-post/:id", getPost)
router.delete("/delete-post/:id", deletePost)
router.put("/upvote-post/:id", upvotePost)
router.put("/downvote-post/:id", downvotePost)
router.get("/:postId/comments", getComments)
router.post("/:postId/comments", addComment)
router.put("/comments/:commentId/upvote", upvoteComment)
router.put("/comments/:commentId/downvote", downvoteComment)
router.delete("/comments/:commentId", deleteComment)

export default router
