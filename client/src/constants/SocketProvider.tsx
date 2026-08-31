import { createContext, useContext, useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"
import { toast } from "sonner"
import { useDispatch } from "react-redux"
import { CHAT_ERROR, NEW_NOTIFICATION } from "./events"
import useSocketEvents from "@/hooks/useSocketEvents"
import { AppDispatch } from "@/app/store"
import { notificationAPI } from "@/app/api/notification"
import { Notification } from "@/utility/types"

type SocketProviderProps = {
  children: React.ReactNode
}

const SocketContext = createContext<Socket | null>(null)

const useSocket = () => useContext(SocketContext)

const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_SERVER_URL, {
      withCredentials: true,
    })

    // Exposing a connection to an external system (Socket.IO), not deriving
    // state from props - the pattern this rule normally guards against.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  useSocketEvents(socket, {
    [CHAT_ERROR]: (data: unknown) => {
      const message =
        (data as { message?: string })?.message || "Something went wrong"
      toast.error(message)
    },
    [NEW_NOTIFICATION]: (data: unknown) => {
      const notification = data as Notification

      dispatch(
        notificationAPI.util.updateQueryData(
          "getNotifications",
          undefined,
          (draft) => {
            draft.notifications.unshift(notification)
          }
        )
      )

      dispatch(
        notificationAPI.util.updateQueryData(
          "getUnreadCount",
          undefined,
          (draft) => {
            draft.count += 1
          }
        )
      )
    },
  })

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  )
}

export { SocketProvider, useSocket }
