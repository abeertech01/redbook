import { NextFunction, Response } from "express"
import { ZodError } from "zod"
import { CONTROLLER_FUNC, IRequest } from "../utils/types"

export interface IError extends Error {
  statusCode?: number
}

const errorMiddleware = (
  err: IError,
  req: IRequest,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: err.issues.map((issue) => issue.message).join(", "),
      errors: err.issues,
    })
    return
  }

  err.message = err.message || "Internal Server Error"
  err.statusCode = err.statusCode || 500

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    error: err,
  })
}

const TryCatch =
  (controllerFunc: CONTROLLER_FUNC) =>
  async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      await controllerFunc(req, res, next)
    } catch (error: unknown) {
      next(error)
    }
  }

export { TryCatch, errorMiddleware }
