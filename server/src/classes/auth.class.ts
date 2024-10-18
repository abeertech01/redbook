import { NextFunction, Response } from "express"
import { TryCatch } from "../middlewares/error"
import { IRequest, User } from "../utils/types"
import { hash } from "bcrypt"
import { ErrorHandler } from "../utils/utility"
import { registerSchema, RegisterSchemaType } from "../lib/zod"
import { sendToken } from "../utils/features"

class Auth {
  public registerUser = TryCatch(
    async (req: IRequest, res: Response, next: NextFunction) => {
      registerSchema.parse(req.body)

      const { name, username, email, password }: RegisterSchemaType = req.body

      const hashedPassword = await hash(password, 13)

      const record = await prisma?.user.findUnique({
        where: {
          email,
        },
      })

      if (record) {
        return next(new ErrorHandler("User already exists", 400))
      }

      const user = await prisma?.user.create({
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
          createdAt: user?.createdAt,
          updatedAt: user?.updatedAt,
        } as User,
        201,
        "User Registered! Successfully!"
      )
    }
  )

  // public loginUser = TryCatch()

  // public logoutUser = TryCatch()
}

export default new Auth()
