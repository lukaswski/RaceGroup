"use client"

import { useState, useEffect } from "react"
import {
  CalendarBlank,
  UserCircle,
  Gear,
  Motorcycle,
  CaretLeft,
  CaretRight,
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
          "relative flex shrink-0 flex-col border-r border-border bg-card transition-all duration-200",
          "border-l-2 border-l-primary/40",
          "lg:translate-x-0",
          isSidebarCollapsed ? "w-14" : "w-56",
          "fixed inset-y-0 left-0 z-50 lg:relative lg:inset-auto",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div
          className={cn(
            "flex h-14 items-center border-b border-border",
            isSidebarCollapsed ? "justify-center px-0" : "gap-2 px-4"
          )}
        >
          <Motorcycle className="size-7 shrink-0 text-primary" weight="duotone" />
          {!isSidebarCollapsed && (
            <Link href="/dashboard" className="font-semibold tracking-tight hover:text-primary">
              Race Group
            </Link>
          )}
        </div>
        <nav
          className={cn(
            "flex flex-1 flex-col gap-1 p-2",
            isSidebarCollapsed ? "items-center" : ""
          )}
        >
          {navItems.map((item) => {
            const isActive =
              item.href !== "#" &&
              (pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href + "/")))
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex rounded-lg text-sm font-medium transition-colors",
                  isSidebarCollapsed ? "items-center justify-center p-2.5" : "items-center gap-3 px-3 py-2.5",
                  isActive
                    ? "bg-primary/12 text-primary ring-1 ring-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon
                  className="size-5 shrink-0"
                  weight={isActive ? "fill" : "regular"}
                />
                {!isSidebarCollapsed && item.label}
              </Link>
            )
          })}
        </nav>
        <button
          onClick={() => setIsSidebarCollapsed((v) => !v)}
          className={cn(
            "absolute -right-4 top-1/2 z-10 hidden h-8 w-6 -translate-y-1/2 items-center justify-center rounded-r-lg border border-l-0 border-border bg-card shadow-sm transition-colors hover:bg-primary/10 hover:border-primary/20 lg:flex",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          )}
          title={isSidebarCollapsed ? "Rozwiń menu" : "Zwiń menu"}
        >
          {isSidebarCollapsed ? (
            <CaretRight className="size-4 text-muted-foreground" />
          ) : (
            <CaretLeft className="size-4 text-muted-foreground" />
          )}
        </button>
      </aside>
      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border border-b-primary/10 px-4 bg-muted/30 lg:px-6">
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
