import express from "express"
import {
  getNotifications,
  getUnreadCount,
  getUnreadMessageCount,
  markAllAsRead,
  markAsRead,
  markChatNotificationsAsRead,
} from "../controllers/notification.controllers"
import { isAuthenticated } from "../middlewares/auth"

const router = express.Router()

// Authorizing the user
router.use(isAuthenticated)

router.get("/", getNotifications)
router.get("/unread-count", getUnreadCount)
router.get("/unread-message-count", getUnreadMessageCount)
router.put("/read-all", markAllAsRead)
router.put("/chat/:chatId/read", markChatNotificationsAsRead)
router.put("/:id/read", markAsRead)

export default router
