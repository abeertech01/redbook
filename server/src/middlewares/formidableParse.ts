import { NextFunction, RequestHandler, Response } from "express"
import formidable from "formidable"
import { IRequest } from "../utils/types"

const fileParse: RequestHandler = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const form = formidable({
    multiples: false,
  })
  const [_, files] = await form.parse(req)

  if (!req.files) req.files = {}

  for (let key in files) {
    const value = files[key]
    if (value) {
      if (value.length > 1) {
        req.files[key] = value
      } else {
        req.files[key] = value[0]
      }
    }
  }

  next()
}

export default fileParse
