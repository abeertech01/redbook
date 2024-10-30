import { NextFunction, Response } from "express"
import { ExtendedSocket, IRequest } from "../utils/types"
import { TryCatch } from "./error"
import { ErrorHandler } from "../utils/utility"
import jwt, { JwtPayload } from "jsonwebtoken"
import express from "express"

interface CustomJwtPayload extends JwtPayload {
  id: string
}

export const isAuthenticated = TryCatch(
  async (req: IRequest, res: Response, next: NextFunction) => {
    const token = req.cookies["redbook-token"]

    if (!token)
      return next(new ErrorHandler("Please login to access this route", 401))

    const decodedData = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as CustomJwtPayload

    req.id = decodedData.id

    next()
  }
)

export const socketAuthenticator = async (
  err: Error,
  socket: ExtendedSocket,
  next: (err?: Error) => void
) => {
  try {
    if (err) return next(err)

    const authToken = (socket.request as express.Request).cookies[
      "redbook-token"
    ]

    if (!authToken)
      return next(new ErrorHandler("Please login to access this route", 401))

    const decodedData = jwt.verify(
      authToken,
      process.env.JWT_SECRET as string
    ) as jwt.JwtPayload

    const user = await prisma?.user.findUnique({
      where: { id: decodedData.id },
    })

    if (!user)
      return next(new ErrorHandler("Please login to access this route", 401))

    socket.user = user

    return next()
  } catch (error) {
    console.error(error)
    return next(new ErrorHandler("Please login to access this route", 401))
  }
}
