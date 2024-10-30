import { Prisma, PrismaClient } from "@prisma/client"
import { DefaultArgs } from "@prisma/client/runtime/library"
import { IRequest, Post } from "../utils/types"

export const upvotePostHelper = async (
  post: Post,
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  authorId: string,
  postId: string
) => {
  const upvoteIds = [...(post?.upvoteIds as string[])]
  const downvoteIds = [...(post?.downvoteIds as string[])]
  let updatedPost: typeof post | undefined

  if (downvoteIds.includes(authorId as string)) {
    downvoteIds.splice(downvoteIds.indexOf(authorId as string), 1)
    upvoteIds.push(authorId as string)
    updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { upvoteIds, downvoteIds },
    })
  } else if (upvoteIds.includes(authorId as string)) {
    upvoteIds.splice(upvoteIds.indexOf(authorId as string), 1)
    updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { upvoteIds },
    })

    return updatedPost
  } else {
    upvoteIds.push(authorId as string)
    updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { upvoteIds },
    })

    return updatedPost
  }
}

export const downvotePostHelper = async (
  post: Post,
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  authorId: string,
  postId: string
) => {
  const upvoteIds = [...(post?.upvoteIds as string[])]
  const downvoteIds = [...(post?.downvoteIds as string[])]
  let updatedPost: typeof post | undefined

  if (upvoteIds.includes(authorId as string)) {
    upvoteIds.splice(downvoteIds.indexOf(authorId as string), 1)
    downvoteIds.push(authorId as string)
    updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { upvoteIds, downvoteIds },
    })
  } else if (downvoteIds.includes(authorId as string)) {
    downvoteIds.splice(downvoteIds.indexOf(authorId as string), 1)
    updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { downvoteIds },
    })

    return updatedPost
  } else {
    downvoteIds.push(authorId as string)
    updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { downvoteIds },
    })

    return updatedPost
  }
}

export const getAllChats = async (
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  req: IRequest
) => {
  const myChats = await prisma.chat.findMany({
    where: {
      OR: [
        {
          creatorId: req.id!,
        },
        {
          members: {
            some: { id: req.id! },
          },
        },
      ],
    },
    include: {
      members: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  })

  return myChats
}
