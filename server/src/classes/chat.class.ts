import { NEW_CHAT, NEW_MESSAGE, CHAT_ERROR } from "../constants/events"
import { ExtendedSocket } from "../utils/types"
import { ErrorHandler } from "../utils/utility"
import prisma from "../lib/prismadb"
import { DefaultEventsMap, Server as SocketServer } from "socket.io"
import { userSocketIDs } from ".."
import { TryCatch } from "../middlewares/error"
import { IRequest } from "../utils/types"
import { NextFunction, Response } from "express"
import { createNotification, getAllChats } from "../lib/helpers"

const MESSAGES_PAGE_SIZE = 20

class Chat {
  private getSockets = (userIds: string[] = []) => {
    const sockets = userIds.map((id: string) =>
      userSocketIDs.get(id.toString()),
    )

    return sockets
  }

  newChat = (
    socket: ExtendedSocket,
    io: SocketServer<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  ) => {
    socket.on(NEW_CHAT, async ({ participantId }) => {
      const chatterSocket = this.getSockets([participantId, socket.user?.id])

      try {
        if (participantId === socket.user?.id) {
          const err = new ErrorHandler("You cannot chat with yourself", 400)
          console.error(err.message)
          return socket.emit(CHAT_ERROR, {
            message: err.message,
            statusCode: err.statusCode,
          })
        }

        const record = await prisma.chat.findFirst({
          where: {
            OR: [
              {
                creatorId: socket.user?.id,
                members: {
                  some: { id: participantId },
                },
              },
              {
                creatorId: participantId,
                members: {
                  some: { id: socket.user?.id },
                },
              },
            ],
          },
        })

        if (record) {
          const err = new ErrorHandler("Chat already exists", 400)
          console.error(err.message)
          return socket.emit(CHAT_ERROR, {
            message: err.message,
            statusCode: err.statusCode,
          })
        }

        const newChat = await prisma.chat.create({
          data: {
            creatorId: socket.user?.id!,
            members: {
              connect: [{ id: participantId }, { id: socket.user?.id }],
            },
          },
          include: {
            members: {
              select: {
                id: true,
                name: true,
                username: true,
                email: true,
                profileImgUrl: true,
                coverImgUrl: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        })

        io.to(chatterSocket).emit(NEW_CHAT, newChat)
      } catch (error: any) {
        const err = new ErrorHandler(error.message, 500)
        console.error(err.message)
        socket.emit(CHAT_ERROR, {
          message: err.message,
          statusCode: err.statusCode,
        })
      }
    })
  }

  newMessage = (
    socket: ExtendedSocket,
    io: SocketServer<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  ) => {
    socket.on(NEW_MESSAGE, async ({ chatId, message: msg }) => {
      console.log("[DEBUG] NEW_MESSAGE received", {
        chatId,
        msg,
        from: socket.user?.id,
      })
      try {
        const newMessage = await prisma.message.create({
          data: {
            chatId: chatId as string,
            authorId: socket.user?.id as string,
            text: msg as string,
          },
        })

        const theChat = await prisma.chat.update({
          where: { id: chatId as string },
          data: {
            lastMessage: msg as string,
          },
          include: {
            members: true,
          },
        })

        const chatterSocket = this.getSockets(
          theChat?.members?.map((member) => member.id),
        )

        console.log(
          "[DEBUG] NEW_MESSAGE broadcasting to sockets",
          chatterSocket,
        )

        io.to(chatterSocket).emit(NEW_MESSAGE, { newMessage })
        io.to(chatterSocket).emit(NEW_CHAT, theChat)

        const recipients = theChat.members.filter(
          (member) => member.id !== socket.user?.id,
        )

        for (const recipient of recipients) {
          await createNotification({
            prisma,
            io,
            recipientId: recipient.id,
            actorId: socket.user?.id as string,
            type: "NEW_MESSAGE",
            chatId: chatId as string,
          })
        }
      } catch (error: any) {
        console.error("[DEBUG] NEW_MESSAGE error", error)
        const err = new ErrorHandler(error.message, 500)
        socket.emit(CHAT_ERROR, {
          message: err.message,
          statusCode: err.statusCode,
        })
      }
    })
  }

  getChats = TryCatch(
    async (req: IRequest, res: Response, next: NextFunction) => {
      const chats = await getAllChats(prisma, req)

      const mappedChats = chats.map((chat) => ({
        ...chat,
        theOtherUserIndex: chat.members.findIndex(
          (member) => member.id !== req.id,
        ),
      }))

      res.status(200).json({
        success: true,
        chats: mappedChats,
      })
    },
  )

  getChatParticipator = TryCatch(
    async (req: IRequest, res: Response, next: NextFunction) => {
      let chat = await prisma.chat.findUnique({
        where: { id: req.params.chatId },
        include: {
          members: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              profileImgUrl: true,
              coverImgUrl: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      })

      const chatParticipator = chat?.members.find(
        (member) => member.id !== req.id,
      )

      res.status(200).json({
        success: true,
        user: chatParticipator,
      })
    },
  )

  getMessages = TryCatch(
    async (req: IRequest, res: Response, next: NextFunction) => {
      const cursor = req.query.cursor as string | undefined

      const rows = await prisma.message.findMany({
        where: {
          chatId: req.params.chatId,
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: MESSAGES_PAGE_SIZE + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      })

      const hasMore = rows.length > MESSAGES_PAGE_SIZE
      const page = hasMore ? rows.slice(0, MESSAGES_PAGE_SIZE) : rows
      const nextCursor = hasMore ? page[page.length - 1].id : null
      const messages = page.reverse()

      const theChat = await prisma.chat.findUnique({
        where: { id: req.params.chatId },
        include: {
          members: true,
        },
      })

      const participator = theChat?.members.find(
        (member) => member.id !== req.id,
      )

      res.status(200).json({
        success: true,
        messages,
        participator,
        hasMore,
        nextCursor,
      })
    },
  )
}

export default new Chat()
