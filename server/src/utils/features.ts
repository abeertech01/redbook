import { CookieOptions, Response } from "express"
import { User } from "./types"
import jwt from "jsonwebtoken"

const cookieOptions: CookieOptions = {
  maxAge: 15 * 24 * 60 * 60 * 1000,
  sameSite: "none",
  httpOnly: true,
  secure: true,
}

const sendToken = (
  res: Response,
  user: User,
  code: number,
  message: string
) => {
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string)

  return res.status(code).cookie("redbook-token", token, cookieOptions).json({
    success: true,
    message,
    user,
  })
}

const isEmail = (str: string) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  return emailPattern.test(str)
}

export { cookieOptions, sendToken, isEmail }
