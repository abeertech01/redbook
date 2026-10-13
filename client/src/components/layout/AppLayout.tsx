import {
  useGetUnreadCountQuery,
  useGetUnreadMessageCountQuery,
} from "@/app/api/notification"
import { RootState } from "@/app/store"
import CreatePostModal from "@/components/CreatePostModal"
import Logo from "@/components/Logo"
import NotificationPanel from "@/components/NotificationPanel"
import PeoplePanel from "@/components/PeoplePanel"
import ThemeToggle from "@/components/ThemeToggle"
import UserAvatar from "@/components/UserAvatar"
import useLogout from "@/hooks/useLogout"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@uidotdev/usehooks"
import { Bell, House, LogOut, MessageSquare, Plus, Store, User } from "lucide-react"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { AppShellContext } from "./AppShellContext"

const CountBadge = ({ count, className }: { count: number; className?: string }) => (
  <span
    className={cn(
      "grid h-4.25 min-w-4.25 place-items-center rounded-full border-2 border-bg bg-brand px-1 text-[10.5px] font-semibold text-white",
      className
    )}
  >
    {count > 99 ? "99+" : count}
  </span>
)

const AppLayout = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user } = useSelector((state: RootState) => state.user)
  const logout = useLogout()

  const [createOpen, setCreateOpen] = useState(false)
  // Remembers which page the notification panel was opened on, so any
  // navigation closes it without needing an effect.
  const [notifOpenOn, setNotifOpenOn] = useState<string | null>(null)
  const notifOpen = notifOpenOn === pathname
  const setNotifOpen = (open: boolean) => setNotifOpenOn(open ? pathname : null)

  const { data: unreadData } = useGetUnreadCountQuery()
  const { data: unreadMessageData } = useGetUnreadMessageCountQuery()
  const unreadCount = unreadData?.count ?? 0
  const unreadMessageCount = unreadMessageData?.count ?? 0

  const isMobile = useMediaQuery("(max-width: 759px)")
  const isNarrow = useMediaQuery("(max-width: 899px)")
  const isWide = useMediaQuery("(min-width: 1220px)")

  const isFeed = pathname === "/"
  const isPost = pathname.startsWith("/post/")
  const isMessages = pathname.startsWith("/messages")
  const isProfile = pathname === "/profile"
  const inChat = /^\/messages\/[^/]+/.test(pathname)

  const showLeft = !isNarrow && !isMessages
  const showRight = isWide && isFeed
  // On a phone an open conversation takes the whole screen, composer
  // included, so the tab bar would only cover it.
  const showBottomNav = isNarrow && !(isMobile && inChat)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCreateOpen(false)
        setNotifOpenOn(null)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const openCreatePost = () => {
    setNotifOpen(false)
    if (!isFeed) navigate("/")
    setCreateOpen(true)
  }

  const navItems = [
    { to: "/", label: "Home", icon: House, active: isFeed || isPost },
    { to: "/profile", label: "Profile", icon: User, active: isProfile },
    {
      to: "/messages",
      label: "Messages",
      icon: MessageSquare,
      active: isMessages,
      badge: unreadMessageCount,
    },
  ]

  const tabs = [
    { key: "home", label: "Home", icon: House, active: isFeed || isPost, onClick: () => navigate("/") },
    {
      key: "msg",
      label: "Messages",
      icon: MessageSquare,
      active: isMessages,
      onClick: () => navigate("/messages"),
      badge: unreadMessageCount,
    },
    { key: "new", label: "New post", icon: Plus, active: false, onClick: openCreatePost },
    {
      key: "bell",
      label: "Alerts",
      icon: Bell,
      active: notifOpen,
      onClick: () => setNotifOpen(!notifOpen),
      badge: unreadCount,
    },
    { key: "profile", label: "Profile", icon: User, active: isProfile, onClick: () => navigate("/profile") },
  ]

  return (
    <AppShellContext.Provider value={{ openCreatePost, isMobile, showBottomNav }}>
      <div className="min-h-screen bg-bg text-ink">
        <header
          className={cn(
            "sticky top-0 z-20 flex h-16 items-center border-b border-line bg-glass backdrop-blur-[14px]",
            isMobile ? "gap-3 px-3.5" : "gap-6 px-6"
          )}
        >
          <Link to="/" aria-label="RedBook home">
            <Logo />
          </Link>
          <div className="flex-1" />
          <div className="relative flex items-center gap-1">
            <ThemeToggle />
            {!isMobile && (
              <button
                type="button"
                onClick={() => setNotifOpen(!notifOpen)}
                aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications"}
                className={cn(
                  "relative grid size-10 cursor-pointer place-items-center rounded-full text-ink hover:bg-chip",
                  notifOpen && "bg-hover-2"
                )}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <CountBadge count={unreadCount} className="absolute top-1.25 right-1" />
                )}
              </button>
            )}
            <Link to="/profile" aria-label="Your profile" className="ml-1">
              <UserAvatar user={user} className="size-9 text-[13px]" />
            </Link>

            <NotificationPanel
              open={notifOpen}
              onClose={() => setNotifOpen(false)}
              mobile={isMobile}
            />
          </div>
        </header>

        <div
          className={cn(
            "mx-auto flex max-w-320 items-start gap-7",
            showBottomNav
              ? isMobile
                ? "px-3 pt-3 pb-22"
                : "px-5 pt-5 pb-23"
              : isMobile
                ? "p-2"
                : "p-6"
          )}
        >
          {showLeft && (
            <nav className="sticky top-22 flex w-55 flex-none flex-col gap-0.5">
              {navItems.map(({ to, label, icon: Icon, active, badge }) => (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex h-11 items-center gap-3 rounded-xl px-3.5 font-medium hover:bg-hover",
                    active ? "bg-hover text-ink" : "text-ink-3b"
                  )}
                >
                  <Icon size={19} />
                  <span className="flex-1">{label}</span>
                  {!!badge && <CountBadge count={badge} className="border-0" />}
                </Link>
              ))}
              <div
                aria-disabled="true"
                className="flex h-11 cursor-default items-center gap-3 rounded-xl px-3.5 font-medium text-faint"
              >
                <Store size={19} />
                <span className="flex-1">Marketplace</span>
                <span className="rounded-md border border-line-3 px-1.5 py-0.5 font-mono text-[10.5px] tracking-[0.04em] text-mute uppercase">
                  Soon
                </span>
              </div>
              <button
                type="button"
                onClick={openCreatePost}
                className="mt-3.5 h-11 cursor-pointer rounded-xl bg-brand text-[15px] font-semibold text-white hover:bg-brand-hover"
              >
                New post
              </button>
              <button
                type="button"
                onClick={logout}
                className="mt-1.5 flex h-10 cursor-pointer items-center gap-2.5 rounded-xl px-3.5 text-sm font-medium text-mute hover:bg-hover hover:text-ink"
              >
                <LogOut size={17} />
                Log out
              </button>
            </nav>
          )}

          <main className="flex min-w-0 flex-1 flex-col gap-4">
            <Outlet />
          </main>

          {showRight && <PeoplePanel />}
        </div>

        {showBottomNav && (
          <nav className="fixed inset-x-0 bottom-0 z-30 flex h-17 items-center border-t border-line bg-glass px-1.5 backdrop-blur-[14px]">
            {tabs.map(({ key, label, icon: Icon, active, onClick, badge }) => (
              <button
                key={key}
                type="button"
                onClick={onClick}
                aria-label={label}
                className={cn(
                  "relative flex h-14 flex-1 cursor-pointer flex-col items-center justify-center gap-1 text-[10.5px] font-semibold",
                  active ? "text-ink" : "text-mute-2"
                )}
              >
                {key === "new" ? (
                  <span className="grid h-9.5 w-12 place-items-center rounded-[14px] bg-brand text-white">
                    <Plus size={22} strokeWidth={2.4} />
                  </span>
                ) : (
                  <>
                    <Icon size={22} />
                    <span>{label}</span>
                  </>
                )}
                {!!badge && (
                  <CountBadge
                    count={badge}
                    className="absolute top-1 left-[calc(50%+4px)] text-[10px] font-bold"
                  />
                )}
              </button>
            ))}
          </nav>
        )}

        <CreatePostModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          mobile={isMobile}
        />
      </div>
    </AppShellContext.Provider>
  )
}

export default AppLayout
