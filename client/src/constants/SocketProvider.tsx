import { createContext, useContext, useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"
import { toast } from "sonner"
import { CHAT_ERROR } from "./events"
import useSocketEvents from "@/hooks/useSocketEvents"

type SocketProviderProps = {
  children: React.ReactNode
}

const SocketContext = createContext<Socket | null>(null)

const useSocket = () => useContext(SocketContext)

const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null)

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
  })

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  )
}

export { SocketProvider, useSocket }
