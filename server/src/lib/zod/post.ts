import { z } from "zod"

export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
})

export type CreatePostSchemaType = z.infer<typeof createPostSchema>

export const addCommentSchema = z.object({
  postId: z.string().min(1, "Post ID has not been placed!!"),
  content: z.string().min(1, "Comment is empty!!"),
})
