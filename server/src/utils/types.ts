import { NextFunction, Request, Response } from "express"

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
