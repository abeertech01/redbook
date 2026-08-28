import { SocketEventHandlers } from "@/utility/types"
import { useEffect, useRef } from "react"
import { Socket } from "socket.io-client"

const useSocketEvents = (
  socket: Socket | null | undefined,
  handlers: SocketEventHandlers
) => {
  const handlersRef = useRef(handlers)

  useEffect(() => {
    handlersRef.current = handlers
  })

  useEffect(() => {
    if (!socket) return

    const events = Object.keys(handlersRef.current)
    const stableHandlers = events.map(
      (event) =>
        (...args: unknown[]) =>
          handlersRef.current[event](...args)
    )

    events.forEach((event, i) => socket.on(event, stableHandlers[i]))

    return () => {
      events.forEach((event, i) => socket.off(event, stableHandlers[i]))
    }
  }, [socket])
}

export default useSocketEvents
