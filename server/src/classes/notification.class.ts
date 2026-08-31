import { NextFunction, Response } from "express"
import { TryCatch } from "../middlewares/error"
import { IRequest } from "../utils/types"
import prisma from "../lib/prismadb"

class Notification {
  getNotifications = TryCatch(
    async (req: IRequest, res: Response, next: NextFunction) => {
      const notifications = await prisma.notification.findMany({
        where: { recipientId: req.id },
        orderBy: { createdAt: "desc" },
        take: 30,
        include: {
          actor: true,
          post: true,
          chat: true,
        },
      })

      res.status(200).json({
        success: true,
        notifications,
      })
    }
  )

  getUnreadCount = TryCatch(
    async (req: IRequest, res: Response, next: NextFunction) => {
      const distinctActivities = await prisma.notification.findMany({
        where: { recipientId: req.id, isRead: false },
        distinct: ["actorId", "type"],
        select: { actorId: true, type: true },
      })

      res.status(200).json({
        success: true,
        count: distinctActivities.length,
      })
    }
  )

  getUnreadMessageCount = TryCatch(
    async (req: IRequest, res: Response, next: NextFunction) => {
      const count = await prisma.notification.count({
        where: { recipientId: req.id, type: "NEW_MESSAGE", isRead: false },
      })

      res.status(200).json({
        success: true,
        count,
      })
    }
  )

  markChatNotificationsAsRead = TryCatch(
    async (req: IRequest, res: Response, next: NextFunction) => {
      const { chatId } = req.params

      const notifications = await prisma.notification.updateMany({
        where: {
          chatId,
          recipientId: req.id,
          type: "NEW_MESSAGE",
          isRead: false,
        },
        data: { isRead: true },
      })

      res.status(200).json({
        success: true,
        notifications,
      })
    }
  )

  markAsRead = TryCatch(
    async (req: IRequest, res: Response, next: NextFunction) => {
      const { id } = req.params

      const notification = await prisma.notification.updateMany({
        where: { id, recipientId: req.id },
        data: { isRead: true },
      })

      res.status(200).json({
        success: true,
        notification,
      })
    }
  )

  markAllAsRead = TryCatch(
    async (req: IRequest, res: Response, next: NextFunction) => {
      const notifications = await prisma.notification.updateMany({
        where: { recipientId: req.id, isRead: false },
        data: { isRead: true },
      })

      res.status(200).json({
        success: true,
        notifications,
      })
    }
  )
}

export default new Notification()
