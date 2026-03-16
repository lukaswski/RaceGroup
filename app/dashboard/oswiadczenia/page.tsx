"use client"

import { useRouter } from "next/navigation"
import { CaretRight, Plus, PencilSimple } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { ResponsiveTableShell } from "@/components/responsive-table-shell"
import eventsData from "@/data/events.json"

export default function OswiadczeniaPage() {
  const router = useRouter()

  const desktopTable = (
    <div className="rounded-lg border border-border bg-card">
      <table className="w-full min-w-[500px] table-fixed text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="w-[40%] px-3 py-2 text-left font-medium">Wydarzenie</th>
            <th className="w-[15%] px-3 py-2 text-left font-medium">Data</th>
            <th className="w-[25%] px-3 py-2 text-left font-medium">Oświadczenia</th>
            <th className="w-[20%] px-3 py-2 text-right" />
          </tr>
        </thead>
        <tbody>
          {eventsData.map((event) => (
            <tr
              key={event.id}
              onClick={() => router.push(`/dashboard/${event.id}`)}
              className="group cursor-pointer border-b border-border last:border-0 transition-colors even:bg-muted/40 hover:bg-muted/50"
            >
              <td className="px-3 py-2">
                <span className="block truncate font-medium">{event.name}</span>
              </td>
              <td className="truncate px-3 py-2 text-muted-foreground">{event.date}</td>
              <td className="px-3 py-2">
                <span className="rounded-lg bg-slate-500/15 px-2 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-400">
                  {(event as { oswiadczenia?: number }).oswiadczenia ?? 0}/{event.maxCapacity ?? 80}
                </span>
              </td>
              <td className="px-3 py-2 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/dashboard/${event.id}`)
                    }}
                  >
                    Wyświetl
                    <CaretRight className="size-4" weight="bold" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const mobileList = (
    <div className="space-y-3">
      {eventsData.map((event) => {
        const count = (event as { oswiadczenia?: number }).oswiadczenia ?? 0
        return (
          <button
            key={event.id}
            type="button"
            onClick={() => router.push(`/dashboard/${event.id}`)}
            className="flex w-full flex-col gap-2 rounded-xl border border-border bg-card p-3 text-left shadow-sm active:bg-muted/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-1">
                <span className="block truncate text-sm font-semibold">{event.name}</span>
                <span className="block text-xs text-muted-foreground">{event.date}</span>
              </div>
              <span className="shrink-0 rounded-lg bg-slate-500/15 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-400">
                {count}/{event.maxCapacity ?? 80} ośw.
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>Przejdź do uczestników</span>
              <CaretRight className="size-4" weight="bold" />
            </div>
          </button>
        )
      })}
    </div>
  )

  return (
    <ResponsiveTableShell
      title="Oświadczenia"
      actions={
        <>
          <Button variant="outline" size="sm" onClick={() => {}}>
            <Plus className="size-4" weight="bold" />
            Dodaj wzór oświadczenia
          </Button>
          <Button variant="outline" size="sm" onClick={() => {}}>
            <PencilSimple className="size-4" weight="bold" />
            Edytuj wzór oświadczenia
          </Button>
        </>
      }
      desktopTable={desktopTable}
      mobileList={mobileList}
    />
  )
}
