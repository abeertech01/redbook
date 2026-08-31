import express from "express"
import {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from "../controllers/notification.controllers"
import { isAuthenticated } from "../middlewares/auth"

const router = express.Router()

// Authorizing the user
router.use(isAuthenticated)

router.get("/", getNotifications)
router.get("/unread-count", getUnreadCount)
router.put("/read-all", markAllAsRead)
router.put("/:id/read", markAsRead)

export default router
