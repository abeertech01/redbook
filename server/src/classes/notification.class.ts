import { NextFunction, Response } from "express"
import { TryCatch } from "../middlewares/error"
import { IRequest } from "../utils/types"
import prisma from "../lib/prismadb"

const NOTIFICATIONS_PAGE_SIZE = 18

class Notification {
  getNotifications = TryCatch(
    async (req: IRequest, res: Response, next: NextFunction) => {
      const cursor = req.query.cursor as string | undefined

      const rows = await prisma.notification.findMany({
        where: { recipientId: req.id },
        // id breaks ties so two notifications created in the same
        // millisecond can't straddle a page boundary and be skipped.
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: NOTIFICATIONS_PAGE_SIZE + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        include: {
          actor: true,
          post: true,
          chat: true,
        },
      })

      const hasMore = rows.length > NOTIFICATIONS_PAGE_SIZE
      const notifications = hasMore
        ? rows.slice(0, NOTIFICATIONS_PAGE_SIZE)
        : rows
      const nextCursor = hasMore
        ? notifications[notifications.length - 1].id
        : null

      res.status(200).json({
        success: true,
        notifications,
        hasMore,
        nextCursor,
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
