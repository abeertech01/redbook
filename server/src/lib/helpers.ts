import { NotificationType, PrismaClient } from "@prisma/client"
import { Comment, IRequest, Post } from "../utils/types"
import { Server as SocketServer } from "socket.io"
import { userSocketIDs } from ".."
import { NEW_NOTIFICATION } from "../constants/events"

const getAllChats = async (prisma: PrismaClient, req: IRequest) => {
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
          messages: true,
          profileImgUrl: true,
          coverImgUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  })

  return myChats
}

const upvotePostHelper = async (
  post: Post,
  prisma: PrismaClient,
  authorId: string,
  postId: string,
  io: SocketServer,
) => {
  const upvoteIds = [...(post?.upvoteIds as string[])]
  const downvoteIds = [...(post?.downvoteIds as string[])]

  console.log("upvoteIds", upvoteIds)
  console.log("downvoteIds", downvoteIds)

  let updatedPost: typeof post | undefined

  if (downvoteIds.includes(authorId as string)) {
    // vote switched: downvote -> upvote
    downvoteIds.splice(downvoteIds.indexOf(authorId as string), 1)
    upvoteIds.push(authorId as string)
    updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { upvoteIds, downvoteIds },
    })

    await createNotification({
      prisma,
      io,
      recipientId: post.authorId,
      actorId: authorId,
      type: "POST_UPVOTE",
      postId,
    })

    return updatedPost
  } else if (upvoteIds.includes(authorId as string)) {
    // vote removed: no notification
    upvoteIds.splice(upvoteIds.indexOf(authorId as string), 1)
    updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { upvoteIds },
    })

    return updatedPost
  } else {
    // vote added
    upvoteIds.push(authorId as string)
    updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { upvoteIds },
    })

    await createNotification({
      prisma,
      io,
      recipientId: post.authorId,
      actorId: authorId,
      type: "POST_UPVOTE",
      postId,
    })

    return updatedPost
  }
}

const downvotePostHelper = async (
  post: Post,
  prisma: PrismaClient,
  authorId: string,
  postId: string,
  io: SocketServer,
) => {
  const upvoteIds = [...(post?.upvoteIds as string[])]
  const downvoteIds = [...(post?.downvoteIds as string[])]
  let updatedPost: typeof post | undefined

  if (upvoteIds.includes(authorId as string)) {
    // vote switched: upvote -> downvote
    upvoteIds.splice(downvoteIds.indexOf(authorId as string), 1)
    downvoteIds.push(authorId as string)
    updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { upvoteIds, downvoteIds },
    })

    await createNotification({
      prisma,
      io,
      recipientId: post.authorId,
      actorId: authorId,
      type: "POST_DOWNVOTE",
      postId,
    })

    return updatedPost
  } else if (downvoteIds.includes(authorId as string)) {
    // vote removed: no notification
    downvoteIds.splice(downvoteIds.indexOf(authorId as string), 1)
    updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { downvoteIds },
    })

    return updatedPost
  } else {
    // vote added
    downvoteIds.push(authorId as string)
    updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { downvoteIds },
    })

    await createNotification({
      prisma,
      io,
      recipientId: post.authorId,
      actorId: authorId,
      type: "POST_DOWNVOTE",
      postId,
    })

    return updatedPost
  }
}

const upvoteCommentHelper = async (
  comment: Comment,
  authorId: string,
  prisma: PrismaClient,
) => {
  const upvoteIds = comment.upvoteIds
  const downvoteIds = comment.downvoteIds
  let updatedComment: Comment

  if (upvoteIds.includes(authorId as string)) {
    //  remove the upvote
    updatedComment = await prisma.comment.update({
      where: { id: comment.id },
      data: {
        upvoteIds: upvoteIds.filter((id) => id !== authorId),
      },
    })

    return updatedComment
  } else {
    if (downvoteIds.includes(authorId as string)) {
      //  remove the downvote
      updatedComment = await prisma.comment.update({
        where: { id: comment.id },
        data: {
          downvoteIds: downvoteIds.filter((id) => id !== authorId),
          upvoteIds: [...(comment.upvoteIds as string[]), authorId as string],
        },
      })

      return updatedComment
    } else {
      updatedComment = await prisma.comment.update({
        where: { id: comment.id },
        data: {
          upvoteIds: [...(comment.upvoteIds as string[]), authorId as string],
        },
      })

      return updatedComment
    }
  }
}

const downvoteCommentHelper = async (
  comment: Comment,
  authorId: string,
  prisma: PrismaClient,
) => {
  const upvoteIds = comment.upvoteIds
  const downvoteIds = comment.downvoteIds
  let updatedComment: Comment

  if (downvoteIds.includes(authorId as string)) {
    // remove the downvote
    updatedComment = await prisma.comment.update({
      where: { id: comment.id },
      data: {
        downvoteIds: downvoteIds.filter((id) => id !== authorId),
      },
    })

    return updatedComment
  } else {
    if (upvoteIds.includes(authorId as string)) {
      // remove the upvote
      updatedComment = await prisma.comment.update({
        where: { id: comment.id },
        data: {
          upvoteIds: upvoteIds.filter((id) => id !== authorId),
          downvoteIds: [
            ...(comment.downvoteIds as string[]),
            authorId as string,
          ],
        },
      })

      return updatedComment
    } else {
      updatedComment = await prisma.comment.update({
        where: { id: comment.id },
        data: {
          downvoteIds: [
            ...(comment.downvoteIds as string[]),
            authorId as string,
          ],
        },
      })

      return updatedComment
    }
  }
}

const createNotification = async ({
  prisma,
  io,
  recipientId,
  actorId,
  type,
  postId,
  chatId,
}: {
  prisma: PrismaClient
  io: SocketServer
  recipientId: string
  actorId: string
  type: NotificationType
  postId?: string
  chatId?: string
}) => {
  if (recipientId === actorId) return

  const notification = await prisma.notification.create({
    data: { recipientId, actorId, type, postId, chatId },
  })

  const socketId = userSocketIDs.get(recipientId)
  if (socketId) {
    io.to(socketId).emit(NEW_NOTIFICATION, notification)
  }

  return notification
}

export {
  getAllChats,
  upvotePostHelper,
  downvotePostHelper,
  upvoteCommentHelper,
  downvoteCommentHelper,
  createNotification,
}
