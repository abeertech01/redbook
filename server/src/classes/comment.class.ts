import { NextFunction, Response } from "express"
import { TryCatch } from "../middlewares/error"
import { IRequest } from "../utils/types"
import prisma from "../lib/prismadb"
import { ErrorHandler } from "../utils/utility"
import { addCommentSchema } from "../lib/zod/post"
import { downvoteCommentHelper, upvoteCommentHelper } from "../lib/helpers"

class Comment {
  getComments = TryCatch(
    async (req: IRequest, res: Response, next: NextFunction) => {
      const { postId } = req.params

      const post = await prisma.post.findUnique({
        where: { id: postId },
      })

      if (!post) return next(new ErrorHandler("Post not found", 404))

      const comments = await prisma.comment.findMany({
        where: { postId: postId as string },
        orderBy: { createdAt: "desc" },
        include: {
          author: true,
        },
      })

      res.status(200).json({
        success: true,
        comments,
      })
    }
  )

  addcomment = TryCatch(
    async (req: IRequest, res: Response, next: NextFunction) => {
      const { postId } = req.params
      const { content } = req.body

      addCommentSchema.parse({ postId, content })

      const post = await prisma.post.findUnique({
        where: { id: postId },
      })

      if (!post) {
        return next(new ErrorHandler("Post not found", 404))
      }

      const comment = await prisma.comment.create({
        data: {
          postId,
          content,
          authorId: req.id as string,
        },
      })

      res.status(200).json({
        success: true,
        comment,
      })
    }
  )

  upvoteComment = TryCatch(
    async (req: IRequest, res: Response, next: NextFunction) => {
      const { commentId } = req.params

      // get the comment by matching the commentId
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
      })

      if (!comment) {
        return next(new ErrorHandler("Comment not found", 404))
      }

      const updatedComment = upvoteCommentHelper(comment, req.id!, prisma)

      res.status(200).json({
        success: true,
        comment: updatedComment,
      })
    }
  )

  downvoteComment = TryCatch(
    async (req: IRequest, res: Response, next: NextFunction) => {
      const { commentId } = req.params

      // get the comment by matching the commentId
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
      })

      if (!comment) {
        return next(new ErrorHandler("Comment not found", 404))
      }

      const updatedComment = downvoteCommentHelper(comment, req.id!, prisma)

      res.status(200).json({
        success: true,
        comment: updatedComment,
      })
    }
  )

  deleteComment = TryCatch(
    async (req: IRequest, res: Response, next: NextFunction) => {
      const { commentId } = req.params

      const record = await prisma.comment.findUnique({
        where: { id: commentId },
      })

      if (!record) return next(new ErrorHandler("Comment not found", 404))

      const comment = await prisma.comment.delete({
        where: { authorId: req.id, id: commentId },
      })

      res.status(200).json({
        success: true,
        comment,
      })
    }
  )
}

export default new Comment()
