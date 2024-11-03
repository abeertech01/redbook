import { NextFunction, Response } from "express"
import { TryCatch } from "../middlewares/error"
import { IRequest } from "../utils/types"
import prisma from "../lib/prismadb"
import { createPostSchema } from "../lib/zod"
import { ErrorHandler } from "../utils/utility"
import { downvotePostHelper, upvotePostHelper } from "../lib/helpers"

class Post {
  createPost = TryCatch(
    async (req: IRequest, res: Response, next: NextFunction) => {
      createPostSchema.parse(req.body)
      const { title, content } = req.body

      const newPost = await prisma.post.create({
        data: {
          title,
          content,
          authorId: req.id as string,
        },
      })

      res.status(200).json({
        success: true,
        post: newPost,
      })
    }
  )

  getPosts = TryCatch(
    async (req: IRequest, res: Response, next: NextFunction) => {
      const posts = await prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          author: true,
          comments: true,
        },
      })

      if (req.query.authorId) {
        const filteredPosts = posts.filter(
          (post) => post.authorId === req.query.authorId
        )

        res.status(200).json({
          success: true,
          posts: filteredPosts,
        })
      }

      res.status(200).json({
        success: true,
        posts,
      })
    }
  )

  getUserPosts = TryCatch(
    async (req: IRequest, res: Response, next: NextFunction) => {
      const posts = await prisma.post.findMany({
        where: { authorId: req.params.id as string },
        orderBy: { createdAt: "desc" },
        include: {
          author: true,
        },
      })

      res.status(200).json({
        success: true,
        posts,
      })
    }
  )

  getPost = TryCatch(
    async (req: IRequest, res: Response, next: NextFunction) => {
      const { id } = req.params

      const post = await prisma.post.findUnique({
        where: { id },
        include: {
          author: true,
          comments: true,
        },
      })

      res.status(200).json({
        success: true,
        post,
      })
    }
  )

  deletePost = TryCatch(
    async (req: IRequest, res: Response, next: NextFunction) => {
      const { id: postId } = req.params

      const record = await prisma.post.findUnique({
        where: { id: postId },
      })

      if (!record) return next(new ErrorHandler("Post not found", 404))

      if (record.authorId !== req.id)
        return next(
          new ErrorHandler("You are not authorized to delete this post", 401)
        )

      const post = await prisma.post.delete({
        where: { authorId: req.id, id: postId },
      })

      res.status(200).json({
        success: true,
        post,
      })
    }
  )

  upvotePost = TryCatch(
    async (req: IRequest, res: Response, next: NextFunction) => {
      const { id: postId } = req.params

      // get the post by matching the postId
      const post = await prisma.post.findUnique({
        where: { id: postId },
      })

      const updatedPost = upvotePostHelper(post!, prisma, req.id!, postId)

      res.status(200).json({
        success: true,
        post: updatedPost,
      })
    }
  )

  downvotePost = TryCatch(
    async (req: IRequest, res: Response, next: NextFunction) => {
      const { id: postId } = req.params

      // get the post by matching the postId
      const post = await prisma.post.findUnique({
        where: { id: postId },
      })

      const updatedPost = downvotePostHelper(post!, prisma, req.id!, postId)

      res.status(200).json({
        success: true,
        post: updatedPost,
      })
    }
  )
}

export default new Post()
