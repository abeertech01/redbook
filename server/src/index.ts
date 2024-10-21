import express, { Request, Response } from "express"
import "dotenv/config"
import cors from "cors"
import { corsOptions } from "./constants/config"
import userRoutes from "./routes/user.routes"
import cookieParser from "cookie-parser"

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors(corsOptions))

app.use("/api/user", userRoutes)

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Hello, TypeScript with Express! Updated!",
    client_url: "http://client:5173",
  })
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
