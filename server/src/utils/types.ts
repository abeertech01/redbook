import { NextFunction, Request, Response } from "express"
import { IncomingMessage } from "http"
import { Socket } from "socket.io"

export interface IRequest extends Request {
  id?: string
}

export interface CONTROLLER_FUNC {
  (req: IRequest, res: Response, next: NextFunction): void | Promise<void>
}

export interface User {
  id: string
  name: string
  username: string
  email: string
  password?: string
  createdAt: Date
  updatedAt: Date
}

export interface Post {
  id: string
  createdAt: Date
  updatedAt: Date
  title: string
  content: string
  upvoteIds: string[]
  downvoteIds: string[]
  authorId: string
  comments?: Comment[]
  author?: User
}

interface IIncomingMessage extends IncomingMessage {
  cookies?: {
    "redbook-token"?: string
  }
}

export interface ExtendedSocket extends Socket {
  request: IIncomingMessage
  user?: User
}
