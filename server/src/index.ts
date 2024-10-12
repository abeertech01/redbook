import express, { Request, Response } from "express"
import "dotenv/config"
import cors from "cors"
import prisma from "./lib/prismadb"

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
)

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Hello, TypeScript with Express! Updated!",
    client_url: "http://client:5173",
  })
})

app.post("/register", async (req: Request, res: Response) => {
  const { name, username, email, password } = req.body

  await prisma.user.create({
    data: {
      name,
      username,
      email,
      password,
    },
  })

  res.send(`Logged in with username: ${username} and password: ${password}`)
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
