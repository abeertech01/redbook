import { NextFunction, Response } from "express"
import { TryCatch } from "../middlewares/error"
import { IRequest } from "../utils/types"
import prisma from "../lib/prismadb"
import { getAllChats } from "../lib/helpers"
import { User as UserType } from "../utils/types"

class User {
  userProfile = TryCatch(
    async (req: IRequest, res: Response, next: NextFunction) => {
      const user = await prisma.user.findUnique({
        where: { id: req.id },
      })

      res.status(200).json({
        success: true,
        user: {
          id: user?.id,
          name: user?.name,
          username: user?.username,
          email: user?.email,
          createdAt: user?.createdAt,
          updatedAt: user?.updatedAt,
        },
      })
    }
  )

  searchUser = TryCatch(
    async (req: IRequest, res: Response, next: NextFunction) => {
      const { name = "" } = req.query

      const myChats = await getAllChats(prisma, req)

      // let allUsers: SearchedUser[]
      let allUsersFromMyChats: UserType[]

      //  extracting All Users from my chats means friends or people I have chatted with
      if (myChats.length > 0) {
        allUsersFromMyChats = myChats.flatMap((chat) => chat.members)
        allUsersFromMyChats = allUsersFromMyChats.filter(
          (user) => user.id !== req.id
        )
      } else {
        allUsersFromMyChats = []
      }

      // Finding all users except me and my friends
      const allUsers = await prisma.user.findMany({
        where: {
          NOT: [
            ...allUsersFromMyChats.map((u) => ({ id: u.id })),
            { id: req.id },
          ],
          name: {
            contains: name as string,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          name: true,
          username: true,
        },
      })

      res.status(200).json({
        success: true,
        users: allUsers,
      })
    }
  )
}

export default new User()
