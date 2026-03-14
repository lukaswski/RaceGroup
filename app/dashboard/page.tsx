"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CaretRight, Check, Link as LinkIcon, Plus, X } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import eventsData from "@/data/events.json"

export default function DashboardEventsPage() {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [linkModalEvent, setLinkModalEvent] = useState<{ name: string; url: string } | null>(null)

  const openLinkModal = (e: React.MouseEvent, event: (typeof eventsData)[0]) => {
    e.stopPropagation()
    const url = (event as { formularzRejestracyjny?: string }).formularzRejestracyjny
    if (url) setLinkModalEvent({ name: event.name, url })
  }

  const closeLinkModal = () => {
    setLinkModalEvent(null)
    setCopied(false)
  }

  const copyLink = async () => {
    if (!linkModalEvent) return
    try {
      await navigator.clipboard.writeText(linkModalEvent.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden p-4 sm:p-6">
      {linkModalEvent && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={closeLinkModal}
            aria-hidden="true"
          />
          <div
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-sm font-semibold">Link do wydarzenia</h3>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={closeLinkModal}
                className="shrink-0"
                title="Zamknij"
              >
                <X className="size-4" weight="bold" />
              </Button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={linkModalEvent.url}
                className="h-9 min-w-0 flex-1 truncate rounded-md border border-input bg-muted/50 px-3 text-sm text-muted-foreground"
              />
              <Button
                size="sm"
                variant={copied ? "default" : "outline"}
                onClick={copyLink}
                className={cn(
                  "h-9 w-[7.5rem] shrink-0 justify-center",
                  copied && "bg-emerald-600 text-white hover:bg-emerald-600 hover:text-white dark:bg-emerald-600 dark:hover:bg-emerald-600"
                )}
              >
                {copied ? (
                  <>
                    <Check className="size-4" weight="bold" />
                    Skopiowano
                  </>
                ) : (
                  <>
                    <LinkIcon className="size-4" weight="bold" />
                    Kopiuj link
                  </>
                )}
              </Button>
            </div>
            <span className="mt-3 block text-xs text-muted-foreground">
              Udostępnij ten link uczestnikom, aby mogli się zarejestrować na wydarzenie „{linkModalEvent.name}”.
            </span>
          </div>
        </>
      )}

      <div className="mb-4 flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <h1 className="text-lg font-semibold sm:text-xl">Wydarzenia</h1>
        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/nowe-wydarzenie")}>
          <Plus className="size-4" weight="bold" />
          Dodaj wydarzenie
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
        <div className="min-w-[700px] rounded-lg border border-border bg-card">
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="w-[18%] px-4 py-3 text-left font-medium">Wydarzenie</th>
                <th className="w-[10%] px-4 py-3 text-left font-medium">Data</th>
                <th className="w-[10%] px-4 py-3 text-left font-medium">Uczestnicy</th>
                <th className="w-[10%] px-4 py-3 text-left font-medium">Opłacone</th>
                <th className="w-[10%] px-4 py-3 text-left font-medium">Gotówka</th>
                <th className="w-[10%] px-4 py-3 text-left font-medium">Wynajmy</th>
                <th className="w-[8%] px-4 py-3 text-left font-medium">Rezerwa</th>
                <th className="w-[24%] px-4 py-3 text-right" />
              </tr>
            </thead>
            <tbody>
              {eventsData.map((event) => (
                <tr
                  key={event.id}
                  onClick={() => router.push(`/dashboard/${event.id}`)}
                  className="group cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-muted/50"
                >
                  <td className="px-4 py-3">
                    <span className="block truncate font-medium">{event.name}</span>
                  </td>
                  <td className="truncate px-4 py-3 text-muted-foreground">{event.date}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {event.participants}/{event.maxCapacity ?? 80}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-lg bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      {event.paid ?? 0}/{event.maxCapacity ?? 80}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-lg bg-blue-500/15 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400">
                      {event.cash ?? 0}/{event.maxCapacity ?? 80}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-lg bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                      {event.wynajmuje ?? 0}/{event.maxWynajmuje ?? 10}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-muted-foreground">
                      {(event.listaRezerwowa ?? 0) > 0
                        ? (event.listaRezerwowa ?? 0)
                        : "–"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {(event as { formularzRejestracyjny?: string }).formularzRejestracyjny ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => openLinkModal(e, event)}
                        >
                          link rej.
                          <LinkIcon className="size-4" weight="bold" />
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">–</span>
                      )}
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
