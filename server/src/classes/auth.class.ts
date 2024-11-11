import { NextFunction, Response } from "express"
import { TryCatch } from "../middlewares/error"
import { IRequest, User } from "../utils/types"
import { compare, hash } from "bcrypt"
import { ErrorHandler } from "../utils/utility"
import { loginSchema, registerSchema, RegisterSchemaType } from "../lib/zod"
import { isEmail, sendToken } from "../utils/features"
import prisma from "../lib/prismadb"

class Auth {
  public registerUser = TryCatch(
    async (req: IRequest, res: Response, next: NextFunction) => {
      registerSchema.parse(req.body)

      const { name, username, email, password }: RegisterSchemaType = req.body

      const hashedPassword = await hash(password, 13)

      const record = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (record) {
        return next(new ErrorHandler("User already exists", 400))
      }

      const user = await prisma.user.create({
        data: {
          name,
          username,
          email,
          password: hashedPassword,
        },
      })

      sendToken(
        res,
        {
          id: user?.id,
          name: user?.name,
          username: user?.username,
          email: user?.email,
          profileImgUrl: user?.profileImgUrl,
          coverImgUrl: user?.coverImgUrl,
          createdAt: user?.createdAt,
          updatedAt: user?.updatedAt,
        } as User,
        201,
        "User Registered! Successfully!"
      )
    }
  )

  public loginUser = TryCatch(
    async (req: IRequest, res: Response, next: NextFunction) => {
      loginSchema.parse(req.body)

      const { userAddress, password } = req.body
      let record

      if (req.cookies["redbook-token"])
        return next(new ErrorHandler("You are already logged in", 400))

      const isEmailAddress: boolean = isEmail(userAddress)

      if (isEmailAddress) {
        record = await prisma.user.findUnique({
          where: { email: userAddress },
        })
      } else {
        record = await prisma.user.findUnique({
          where: { username: userAddress },
        })
      }

      if (!record) return next(new ErrorHandler("User not found", 404))

      const passwordMatched = await compare(password, record.password)

      if (!passwordMatched)
        return next(new ErrorHandler("Invalid credentials", 401))

      sendToken(
        res,
        {
          id: record.id,
          name: record.name,
          username: record.username,
          email: record.email,
          profileImgUrl: record?.profileImgUrl,
          coverImgUrl: record?.coverImgUrl,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
        },
        200,
        "User logged in!"
      )
    }
  )

  public logoutUser = TryCatch(
    async (req: IRequest, res: Response, next: NextFunction) => {
      res.clearCookie("redbook-token")
      res.status(200).json({
        success: true,
        message: "Logged out successfully!",
      })
    }
  )
}

export default new Auth()
