import { cn } from "@/lib/utils"
import { User } from "@/utility/types"
import { useState } from "react"

// Every account starts with this placeholder as its profileImgUrl (the
// schema default), so it counts as "no photo" and gets initials instead.
const DEFAULT_IMG = "github.com/shadcn.png"

// Skips abbreviation tokens like "Fk." (the seeded fake users' name prefix)
// so they don't all collapse to the same leading "F".
const initialsOf = (name = "") =>
  name
    .split(/\s+/)
    .filter((word) => word && !/^\p{L}+\.$/u.test(word))
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("")

// Stable per-user hue, so someone's initials circle is the same color
// everywhere they appear.
const hueOf = (seed = "") => {
  let hash = 0
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) | 0
  return Math.abs(hash) % 360
}

type UserAvatarProps = {
  user?: Pick<User, "id" | "name" | "profileImgUrl"> | null
  className?: string
}

const UserAvatar = ({ user, className }: UserAvatarProps) => {
  const [failed, setFailed] = useState(false)
  const url = user?.profileImgUrl
  const hasPhoto = !!url && !url.includes(DEFAULT_IMG) && !failed

  return (
    <div
      className={cn(
        "grid size-10 flex-none select-none place-items-center overflow-hidden rounded-full font-semibold text-white",
        className
      )}
      style={
        hasPhoto
          ? undefined
          : { background: `oklch(0.5 0.12 ${hueOf(user?.id ?? user?.name)})` }
      }
    >
      {hasPhoto ? (
        <img
          src={url}
          alt={user?.name ?? ""}
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      ) : (
        initialsOf(user?.name)
      )}
    </div>
  )
}

export default UserAvatar
