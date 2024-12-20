import { NextFunction, Response } from "express"
import { TryCatch } from "../middlewares/error"
import { IRequest } from "../utils/types"
import prisma from "../lib/prismadb"
import { getAllChats } from "../lib/helpers"
import { User as UserType } from "../utils/types"
import { v2 as cloudinary } from "cloudinary"
import { File } from "formidable"
import { ErrorHandler } from "../utils/utility"

class User {
  userProfile = TryCatch(
    async (req: IRequest, res: Response, next: NextFunction) => {
      const user = await prisma.user.findUnique({
        where: { id: req.id },
      })

      console.log(user)

      if (!user) return next(new ErrorHandler("User needs to log in", 404))

      res.status(200).json({
        success: true,
        user: {
          id: user?.id,
          name: user?.name,
          username: user?.username,
          email: user?.email,
          bio: user?.bio ?? null,
          profileImgUrl: user?.profileImgUrl,
          coverImgUrl: user?.coverImgUrl,
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
          profileImgUrl: true,
          coverImgUrl: true,
        },
      })

      res.status(200).json({
        success: true,
        users: allUsers,
      })
    }
  )

  updateBio = TryCatch(
    async (req: IRequest, res: Response, next: NextFunction) => {
      const { bio } = req.body
      const bioAddedUser = await prisma.user.update({
        where: { id: req.id },
        data: { bio },
      })

      res.status(200).json({ success: true, user: bioAddedUser })
    }
  )

  get10RandomUsers = TryCatch(
    async (req: IRequest, res: Response, next: NextFunction) => {
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

      // Fetch the latest 50 users
      const recentUsers = await prisma.user.findMany({
        where: {
          NOT: [
            ...allUsersFromMyChats.map((u) => ({ id: u.id })),
            { id: req.id },
          ],
        },
        take: 50,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          bio: true,
          profileImgUrl: true,
          coverImgUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      // Randomly select 10 users from the recent 50
      const randomUsers = recentUsers
        .sort(() => 0.5 - Math.random()) // Shuffle the array
        .slice(0, 10) // Take the first 10

      res.status(200).json({ success: true, users: randomUsers })
    }
  )

  uploadProfileImage = TryCatch(
    async (req: IRequest, res: Response, next: NextFunction) => {
      const { files } = req
      const myFile = files!.profileImage

      const result = await cloudinary.uploader.upload(
        (myFile as File).filepath,
        { folder: "redbook_avatars" }
      )

      //default image = https://github.com/shadcn.png

      const signedInUser = await prisma.user.findUnique({
        where: {
          id: req.id,
        },
      })

      if (signedInUser?.profileImgUrl !== "https://github.com/shadcn.png") {
        await cloudinary.uploader.destroy(
          signedInUser?.profileImgPId as string,
          {
            resource_type: "image",
            invalidate: true,
          }
        )
      }

      const theUser = await prisma.user.update({
        where: {
          id: req.id,
        },
        data: {
          profileImgUrl: result.secure_url,
          profileImgPId: result.public_id,
        },
      })

      res.status(200).json({
        success: true,
        user: theUser,
      })
    }
  )

  uploadCoverImage = TryCatch(
    async (req: IRequest, res: Response, next: NextFunction) => {
      const { files } = req
      const myFile = files!.coverImage

      const result = await cloudinary.uploader.upload(
        (myFile as File).filepath,
        { folder: "redbook_covers" }
      )

      /**
       * default image = https://cdn.pixabay.com/photo/2021/10/13/13/19/bmw-6706660_1280.jpg
       */

      const signedInUser = await prisma.user.findUnique({
        where: {
          id: req.id,
        },
      })

      if (
        signedInUser?.coverImgUrl !==
        "https://cdn.pixabay.com/photo/2021/10/13/13/19/bmw-6706660_1280.jpg"
      ) {
        await cloudinary.uploader.destroy(signedInUser?.coverImgPId as string, {
          resource_type: "image",
          invalidate: true,
        })
      }

      const theUser = await prisma.user.update({
        where: {
          id: req.id,
        },
        data: {
          coverImgUrl: result.secure_url,
          coverImgPId: result.public_id,
        },
      })

      res.status(200).json({
        success: true,
        user: theUser,
      })
    }
  )
}

export default new User()
