import { createContext, useContext } from "react"

type AppShellState = {
  openCreatePost: () => void
  /** Below 760px - single-column phone layout. */
  isMobile: boolean
  /** Below 900px the left sidebar gives way to a fixed bottom tab bar. */
  showBottomNav: boolean
}

export const AppShellContext = createContext<AppShellState>({
  openCreatePost: () => {},
  isMobile: false,
  showBottomNav: false,
})

export const useAppShell = () => useContext(AppShellContext)
