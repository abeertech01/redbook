import { createContext, useContext, useEffect, useState } from "react"

type ResolvedTheme = "dark" | "light"

type ThemeProviderProps = {
  children: React.ReactNode
  storageKey?: string
}

type ThemeProviderState = {
  theme: ResolvedTheme
  toggleTheme: () => void
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined
)

const systemTheme = (): ResolvedTheme =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"

const readStored = (storageKey: string): ResolvedTheme | null => {
  try {
    const stored = localStorage.getItem(storageKey)
    return stored === "dark" || stored === "light" ? stored : null
  } catch {
    return null
  }
}

export function ThemeProvider({
  children,
  storageKey = "vite-ui-theme",
}: ThemeProviderProps) {
  // null until the user picks a theme with the toggle - until then the OS
  // preference decides, and keeps deciding if it changes mid-session.
  const [chosen, setChosen] = useState<ResolvedTheme | null>(() =>
    readStored(storageKey)
  )
  const [system, setSystem] = useState<ResolvedTheme>(systemTheme)

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => setSystem(media.matches ? "dark" : "light")
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [])

  const theme = chosen ?? system

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
  }, [theme])

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark"
    try {
      localStorage.setItem(storageKey, next)
    } catch {
      // Storage can be blocked (private mode) - the toggle still works for
      // this session, it just won't be remembered.
    }
    setChosen(next)
  }

  return (
    <ThemeProviderContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
