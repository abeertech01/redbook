import express, { Request, Response, Express } from "express"
import "dotenv/config"
import cors from "cors"
import { corsOptions } from "./constants/config"
import userRoutes from "./routes/user.routes"
import postRoutes from "./routes/post.routes"
import chatRoutes from "./routes/chat.routes"
import cookieParser from "cookie-parser"
import { errorMiddleware } from "./middlewares/error"
import { createServer } from "http"
import { Server } from "socket.io"
import { ExtendedSocket } from "./utils/types"
import { socketAuthenticator } from "./middlewares/auth"
import chatClass from "./classes/chat.class"
import { generateFakePosts, generateFakeUsers } from "./utils/utility"
import { v2 as cloudinary } from "cloudinary"

const userSocketIDs = new Map()

const app: Express = express()
const PORT = process.env.PORT || 3000
const server = createServer(app)
const io = new Server(server, {
  cors: corsOptions,
})

app.set("io", io)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors(corsOptions))

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

app.use("/api/user", userRoutes)
app.use("/api/post", postRoutes)
app.use("/api/chat", chatRoutes)

// Fake Data Generating to make a good-looking social media app
;(async function (userNumeber: number) {
  await generateFakeUsers(userNumeber)
  await generateFakePosts()
})(100)

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Hello, TypeScript with Express! Updated!",
  })
})

io.use((socket, next) => {
  const request = socket.request as express.Request & { res: express.Response }
  cookieParser()(
    request,
    request.res,
    async (err) => await socketAuthenticator(err, socket, next)
  )
})

io.on("connection", (socket: ExtendedSocket) => {
  const user = socket.user
  userSocketIDs.set(user?.id.toString(), socket.id)

  chatClass.newChat(socket, io)

  chatClass.newMessage(socket, io)
})

app.use(errorMiddleware)

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
})

export { userSocketIDs }
