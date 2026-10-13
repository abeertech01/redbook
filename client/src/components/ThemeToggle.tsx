import { useTheme } from "@/constants/ThemeProvider"
import { Moon, Sun } from "lucide-react"

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()
  const label = theme === "light" ? "Switch to dark" : "Switch to light"

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="grid size-10 cursor-pointer place-items-center rounded-full text-ink-3b hover:bg-chip hover:text-ink"
    >
      {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  )
}
export default ThemeToggle
