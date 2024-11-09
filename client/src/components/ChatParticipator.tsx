import React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatHumanReadTimestamp } from "@/lib/helper"
import { useGetChatParticipatorQuery } from "@/app/api/chat"

type ChatParticipatorProps = {
  chatId: string
}

const ChatParticipator: React.FC<ChatParticipatorProps> = ({ chatId }) => {
  const { data, isLoading: _ } = useGetChatParticipatorQuery(chatId)

  return (
    <div className="w-full h-full">
      <Avatar className="w-28 h-28 mx-auto my-5">
        <AvatarImage src={data?.user.profileImgUrl} />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>

      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl">{data?.user.name}</h1>
        <div className="text-center">
          <h1 className="text-zinc-400 text-sm">Username</h1>
          <p>@{data?.user.username}</p>
        </div>
        <div className="text-center">
          <h1 className="text-zinc-400 text-sm">Email</h1>
          <p>{data?.user.email}</p>
        </div>
        <div className="text-center w-4/5">
          <h1 className="text-zinc-400 text-sm">Bio</h1>
          <p>{data?.user.bio ?? "Bio is not added"}</p>
        </div>
        <div className="text-center">
          <h1 className="text-zinc-400 text-sm">Joined</h1>
          <p>{formatHumanReadTimestamp(data?.user.createdAt as Date)}</p>
        </div>
      </div>
    </div>
  )
}
export default ChatParticipator
