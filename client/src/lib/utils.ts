import { Message } from "@/utility/types"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getLatestMessage(messages: Message[]): string | null {
  if (messages.length === 0) return "No messages yet..."

  const message = messages?.reduce((latest, current) =>
    current.createdAt > latest.createdAt ? current : latest
  )

  return message.text
}
