import { cn } from "@/lib/utils"
import { ArrowBigDown, ArrowBigUp } from "lucide-react"

type VoteControlsProps = {
  upvoteIds: string[]
  downvoteIds: string[]
  userId: string
  onUpvote: () => void
  onDownvote: () => void
  disabled?: boolean
  /** "pill" groups both buttons in a bordered chip (posts); "plain" is the
   * lighter inline pair used under comments. */
  variant?: "pill" | "plain"
  size?: "md" | "lg"
}

const VoteControls = ({
  upvoteIds,
  downvoteIds,
  userId,
  onUpvote,
  onDownvote,
  disabled,
  variant = "pill",
  size = "md",
}: VoteControlsProps) => {
  const up = upvoteIds.includes(userId)
  const down = downvoteIds.includes(userId)
  const plain = variant === "plain"

  const button = cn(
    "flex items-center rounded-full font-semibold cursor-pointer disabled:cursor-default",
    plain
      ? "h-7.5 gap-1.25 pl-2 pr-2.5 text-[13px]"
      : size === "lg"
        ? "h-9 gap-1.5 pl-2.75 pr-3.25 text-sm"
        : "h-8.5 gap-1.5 pl-2.5 pr-3 text-[13.5px]"
  )
  const iconSize = plain ? 14 : 16

  const upButton = (
    <button
      type="button"
      onClick={onUpvote}
      disabled={disabled}
      aria-label="Upvote"
      aria-pressed={up}
      className={cn(
        button,
        up ? "bg-brand/16 text-accent-text" : "text-ink-3b hover:text-ink"
      )}
    >
      <ArrowBigUp size={iconSize} strokeWidth={2} />
      {upvoteIds.length}
    </button>
  )
  const downButton = (
    <button
      type="button"
      onClick={onDownvote}
      disabled={disabled}
      aria-label="Downvote"
      aria-pressed={down}
      className={cn(
        button,
        down ? "bg-[#6ea8ff]/16 text-down" : "text-ink-3b hover:text-ink"
      )}
    >
      <ArrowBigDown size={iconSize} strokeWidth={2} />
      {downvoteIds.length}
    </button>
  )

  if (plain) {
    return (
      <div className="flex items-center gap-1">
        {upButton}
        {downButton}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex items-center rounded-full border border-line-2 bg-chip",
        size === "lg" ? "h-9.5" : "h-9"
      )}
    >
      {upButton}
      <span className="h-4 w-px bg-line-3" />
      {downButton}
    </div>
  )
}

export default VoteControls
