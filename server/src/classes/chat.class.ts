import { NEW_CHAT, NEW_MESSAGE } from "../constants/events"
import { ExtendedSocket } from "../utils/types"
import { ErrorHandler } from "../utils/utility"
import prisma from "../lib/prismadb"
import { DefaultEventsMap, Server } from "socket.io"
import { userSocketIDs } from ".."
import { TryCatch } from "../middlewares/error"
import { IRequest } from "../utils/types"
import { NextFunction, Response } from "express"
import { getAllChats } from "../lib/helpers"

class Chat {
  private getSockets = (userIds: string[] = []) => {
    const sockets = userIds.map((id: string) =>
      userSocketIDs.get(id.toString())
    )

    return sockets
  }

  newChat = (
    socket: ExtendedSocket,
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
  ) => {
    socket.on(NEW_CHAT, async ({ participantId }) => {
      const chatterSocket = this.getSockets([participantId, socket.user?.id])

      try {
        if (participantId === socket.user?.id)
          return new ErrorHandler("You cannot chat with yourself", 400)

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

        if (record) return new ErrorHandler("Chat already exists", 400)

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
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        })

        io.to(chatterSocket).emit(NEW_CHAT, newChat)
      } catch (error: any) {
        return new ErrorHandler(error.message, 500)
      }
    })
  }

  newMessage = (
    socket: ExtendedSocket,
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
  ) => {
    socket.on(NEW_MESSAGE, async ({ chatId, message: msg }) => {
      try {
        const newMessage = await prisma.message.create({
          data: {
            chatId: chatId as string,
            authorId: socket.user?.id as string,
            text: msg as string,
          },
        })

        // const theChat = await prisma.chat.findUnique({
        //   where: { id: chatId as string },
        //   include: {
        //     members: true,
        //   },
        // })
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
          theChat?.members?.map((member) => member.id)
        )

        io.to(chatterSocket).emit(NEW_MESSAGE, { newMessage })
      } catch (error: any) {
        return new ErrorHandler(error.message, 500)
      }
    })
  }

  getChats = TryCatch(
    async (req: IRequest, res: Response, next: NextFunction) => {
      const chats = await getAllChats(prisma, req)

      const mappedChats = chats.map((chat) => ({
        ...chat,
        theOtherUserIndex: chat.members.findIndex(
          (member) => member.id !== req.id
        ),
      }))

      res.status(200).json({
        success: true,
        chats: mappedChats,
      })
    }
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
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      })

      const chatParticipator = chat?.members.find(
        (member) => member.id !== req.id
      )

      res.status(200).json({
        success: true,
        user: chatParticipator,
      })
    }
  )

  getMessages = TryCatch(
    async (req: IRequest, res: Response, next: NextFunction) => {
      const messages = await prisma.message.findMany({
        where: {
          chatId: req.params.chatId,
        },
      })

      const theChat = await prisma.chat.findUnique({
        where: { id: req.params.chatId },
        include: {
          members: true,
        },
      })

      const participator = theChat?.members.find(
        (member) => member.id !== req.id
      )

      res.status(200).json({
        success: true,
        messages,
        participator,
      })
    }
  )
}

export default new Chat()
