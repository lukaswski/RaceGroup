"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

type ResponsiveTableShellProps = {
  title: string
  description?: string
  actions?: ReactNode
  /** Pełna tabela dla desktopu (md+), zwykle <table> w karcie */
  desktopTable: ReactNode
  /** Lista kart / elementów dla mobile (<md) */
  mobileList: ReactNode
  /** Dodatkowe klasy dla root kontenera strony (bez paddingu) */
  className?: string
}

export function ResponsiveTableShell({
  title,
  description,
  actions,
  desktopTable,
  mobileList,
  className,
}: ResponsiveTableShellProps) {
  return (
    <div className={cn("flex flex-1 flex-col overflow-hidden p-4 sm:p-6", className)}>
      <div className="mb-4 flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold sm:text-xl">{title}</h1>
          {description && (
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Desktop: klasyczna tabela w karcie z ewentualnym poziomym scrollem */}
      <div className="hidden min-h-0 flex-1 overflow-x-auto overflow-y-auto md:block">
        {desktopTable}
      </div>

      {/* Mobile: lista kart zamiast tabeli, bez sztucznego min-w */}
      <div className="min-h-0 flex-1 overflow-y-auto md:hidden">
        {mobileList}
      </div>
    </div>
  )
}

