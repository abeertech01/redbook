import { NextFunction, Request, Response } from "express"
import { File } from "formidable"
import { IncomingMessage } from "http"
import { Socket } from "socket.io"

export interface IRequest extends Request {
  id?: string
  files?: { [key: string]: File | File[] }
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
  profileImgUrl: string
  coverImgUrl: string
  profileImgPId?: string | null
  coverImgPId?: string | null
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

export interface Comment {
  id: string
  createdAt: Date
  updatedAt: Date
  content: string
  upvoteIds: string[]
  downvoteIds: string[]
  authorId: string
  author?: User
  postId: string
}
