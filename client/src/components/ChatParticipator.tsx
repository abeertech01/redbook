import { formatHumanReadTimestamp } from "@/lib/helper"
import { useGetChatParticipatorQuery } from "@/app/api/chat"
import UserAvatar from "./UserAvatar"

type ChatParticipatorProps = {
  chatId: string
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1">
    <span className="font-mono text-[11px] tracking-[0.08em] text-mute-2 uppercase">
      {label}
    </span>
    {children}
  </div>
)

const ChatParticipator = ({ chatId }: ChatParticipatorProps) => {
  const { data } = useGetChatParticipatorQuery(chatId)
  const user = data?.user

  return (
    <div className="flex w-70 flex-none flex-col items-center gap-5 overflow-auto border-l border-line px-5.5 py-8">
      <div className="flex flex-col items-center gap-2.5">
        <UserAvatar user={user} className="size-24 text-[30px]" />
        <div className="text-center">
          <div className="text-[19px] font-bold tracking-[-0.01em]">{user?.name}</div>
          <div className="mt-0.5 text-[13.5px] text-mute">@{user?.username}</div>
        </div>
      </div>
      <div className="h-px self-stretch bg-line" />
      <div className="flex flex-col gap-4 self-stretch">
        <Field label="Email">
          <span className="text-sm break-all text-ink-2">{user?.email}</span>
        </Field>
        <Field label="Bio">
          {user?.bio ? (
            <span className="text-sm whitespace-pre-line text-ink-2">{user.bio}</span>
          ) : (
            <span className="text-sm text-mute-2">No bio yet</span>
          )}
        </Field>
        <Field label="Joined">
          <span className="text-sm text-ink-2">
            {user && formatHumanReadTimestamp(user.createdAt)}
          </span>
        </Field>
      </div>
    </div>
  )
}
export default ChatParticipator
