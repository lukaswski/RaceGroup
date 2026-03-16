"use client"

import { useState, useEffect } from "react"
import {
  CalendarBlank,
  UserCircle,
  Gear,
  Motorcycle,
  List,
  Sun,
  Moon,
  FileText,
} from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const navItems = [
    { href: "/dashboard", label: "Wydarzenia", icon: CalendarBlank },
    { href: "/dashboard/wynajmy", label: "Wynajmy", icon: Motorcycle },
    { href: "/dashboard/oswiadczenia", label: "Oświadczenia", icon: FileText },
    { href: "#", label: "Ustawienia", icon: Gear },
    { href: "#", label: "Moje konto", icon: UserCircle },
  ]

  return (
    <div className="flex min-h-svh bg-background">
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden",
          isMobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "relative flex shrink-0 flex-col transition-all duration-300 ease-out",
          "bg-sidebar text-sidebar-foreground",
          "border-r border-sidebar-border/80",
          "shadow-[2px_0_24px_-4px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_24px_-4px_rgba(0,0,0,0.25)]",
          "lg:translate-x-0",
          isSidebarCollapsed ? "w-[4.25rem]" : "w-60",
          "fixed inset-y-0 left-0 z-50 lg:relative lg:inset-auto",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo / brand – wysokość jak header (h-14), żeby linie były równo */}
        <div
          className={cn(
            "flex h-14 items-center gap-3 border-b border-sidebar-border/60",
            isSidebarCollapsed ? "justify-center px-0" : "px-4"
          )}
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary shadow-inner">
            <Motorcycle className="size-4" weight="duotone" />
          </div>
          {!isSidebarCollapsed && (
            <Link
              href="/dashboard"
              className="truncate font-semibold tracking-tight text-sidebar-foreground hover:text-sidebar-primary transition-colors"
            >
              Race Group
            </Link>
          )}
        </div>

        <nav
          className={cn(
            "flex flex-1 flex-col gap-0.5 p-3",
            isSidebarCollapsed ? "items-center pt-4" : ""
          )}
        >
          {navItems.map((item) => {
            const isEventsActive =
              pathname === "/dashboard" ||
              (pathname.startsWith("/dashboard/") &&
                !["wynajmy", "oswiadczenia", "nowe-wydarzenie"].some((s) =>
                  pathname.startsWith(`/dashboard/${s}`)
                ))
            const isActive =
              item.href !== "#" &&
              (item.href === "/dashboard"
                ? isEventsActive
                : pathname === item.href || pathname.startsWith(item.href + "/"))
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center rounded-xl text-sm font-medium transition-all duration-200",
                  isSidebarCollapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
                  isActive && !isSidebarCollapsed && "border-l-[3px] border-sidebar-primary pl-[calc(0.75rem+3px)]",
                  isActive && isSidebarCollapsed && "border-l-2 border-sidebar-primary",
                  !isActive && !isSidebarCollapsed && "border-l-[3px] border-transparent pl-3"
                )}
              >
                <Icon
                  className="size-5 shrink-0"
                  weight={isActive ? "fill" : "regular"}
                />
                {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Pionowy pasek do zwijania – na środku krawędzi (jak na iPhonie) */}
        <button
          onClick={() => setIsSidebarCollapsed((v) => !v)}
          className="absolute right-0 top-1/2 z-10 hidden h-12 w-1.5 -translate-y-1/2 cursor-pointer rounded-full bg-sidebar-foreground/25 transition-colors hover:bg-sidebar-primary/50 lg:block"
          title={isSidebarCollapsed ? "Rozwiń menu" : "Zwiń menu"}
          aria-label={isSidebarCollapsed ? "Rozwiń menu" : "Zwiń menu"}
        />
      </aside>
      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border border-b-primary/10 px-4 bg-muted lg:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Button
              variant="ghost"
              size="icon-sm"
              className="shrink-0 lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
              title="Menu"
            >
              <List className="size-5" weight="bold" />
            </Button>
            <div className="flex min-w-0 flex-1 flex-col justify-center truncate">
              <span className="truncate text-sm font-medium text-foreground">Witaj, Marek</span>
              <span className="hidden truncate text-xs text-muted-foreground sm:block">Co gdzie dziś jeździmy</span>
            </div>
          </div>
          <div className="flex h-6 w-[72px] items-center gap-2" suppressHydrationWarning>
            {mounted && (
              <>
                <Sun className="size-4 shrink-0 text-muted-foreground" weight={resolvedTheme === "light" ? "fill" : "regular"} />
                <Switch
                  checked={resolvedTheme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                  title="Przełącz motyw: jasny / ciemny"
                />
                <Moon className="size-4 shrink-0 text-muted-foreground" weight={resolvedTheme === "dark" ? "fill" : "regular"} />
              </>
            )}
          </div>
        </header>
        {children}
      </main>
    </div>
  )
}
