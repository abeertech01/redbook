import { useGet10RandomUsersQuery } from "@/app/api/user"
import useStartChat from "@/hooks/useStartChat"
import { MessageSquare } from "lucide-react"
import UserAvatar from "./UserAvatar"

const PeoplePanel = () => {
  const startChat = useStartChat()
  const { data } = useGet10RandomUsersQuery()
  const people = data?.users ?? []

  return (
    <aside className="sticky top-22 w-75 flex-none rounded-[18px] border border-line bg-surface px-2.5 pt-4.5 pb-2.5">
      <div className="px-2.5 pb-2.5 text-[15px] font-semibold">
        People to chat with
      </div>
      <div className="flex flex-col">
        {people.map((person) => (
          <button
            key={person.id}
            type="button"
            onClick={() => startChat(person.id)}
            className="flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2.25 text-left hover:bg-chip"
          >
            <UserAvatar user={person} className="size-9.5 text-[13px]" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{person.name}</div>
              <div className="truncate text-[12.5px] text-mute-2">
                @{person.username}
              </div>
            </div>
            <MessageSquare size={16} className="flex-none text-faint" />
          </button>
        ))}
      </div>
    </aside>
  )
}

export default PeoplePanel
