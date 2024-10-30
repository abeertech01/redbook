import express from "express"
import { getChats, getMessages } from "../controllers/chat.controllers"
import { isAuthenticated } from "../middlewares/auth"

const router = express.Router()

// Authorizing the user
router.use(isAuthenticated)

router.get("/get-chats", getChats)
router.get("/get-messages/:chatId", getMessages)

export default router
