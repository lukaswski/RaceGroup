"use client"

import { useRouter } from "next/navigation"
import { CaretRight, Plus, PencilSimple } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import eventsData from "@/data/events.json"

export default function OswiadczeniaPage() {
  const router = useRouter()

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-4 sm:p-6">
      <div className="mb-4 flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <h1 className="text-lg font-semibold sm:text-xl">Oświadczenia</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => {}}>
            <Plus className="size-4" weight="bold" />
            Dodaj wzór oświadczenia
          </Button>
          <Button variant="outline" size="sm" onClick={() => {}}>
            <PencilSimple className="size-4" weight="bold" />
            Edytuj wzór oświadczenia
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
        <div className="min-w-[500px] rounded-lg border border-border bg-card">
          <table className="w-full table-fixed text-sm">
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
      </div>
    </div>
  )
}
