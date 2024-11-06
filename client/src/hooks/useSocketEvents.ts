import { SocketEventHandlers } from "@/utility/types"
import { useEffect } from "react"
import { Socket } from "socket.io-client"

const useSocketEvents = (socket: Socket, handlers: SocketEventHandlers) => {
  useEffect(() => {
    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler)
    })

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        socket.off(event, handler)
      })
    }
  }, [socket, handlers])
}

export default useSocketEvents
