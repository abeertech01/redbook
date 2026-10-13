import { cn } from "@/lib/utils"

type LogoProps = {
  size?: "md" | "lg"
}

const Logo = ({ size = "md" }: LogoProps) => {
  const lg = size === "lg"

  return (
    <div
      className={cn("flex items-center leading-none", lg ? "gap-3" : "gap-2.5")}
    >
      <div
        className={cn(
          "grid flex-none place-items-center bg-brand shadow-[inset_0_-3px_0_rgba(0,0,0,0.18)]",
          lg ? "size-11 rounded-[13px]" : "size-8 rounded-[10px]"
        )}
      >
        <span
          className={cn(
            "font-display font-extrabold leading-none tracking-[-0.04em] text-white",
            lg ? "text-[31px]" : "text-[22px]"
          )}
        >
          r
        </span>
      </div>
      <span
        className={cn(
          "font-display font-extrabold tracking-[-0.045em] text-ink",
          lg ? "text-[31px]" : "text-2xl"
        )}
      >
        red<span className="text-brand">book</span>
      </span>
    </div>
  )
}

export default Logo
