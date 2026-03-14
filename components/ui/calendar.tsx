"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { pl } from "react-day-picker/locale"
import "react-day-picker/style.css"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  showOutsideDays = true,
  locale = pl,
  ...props
}: CalendarProps) {
  return (
    <div
      className={cn(
        "rdp-root rounded-lg border border-border bg-card p-3 text-card-foreground",
        className
      )}
    >
      <DayPicker
        locale={locale}
        showOutsideDays={showOutsideDays}
        {...props}
      />
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
