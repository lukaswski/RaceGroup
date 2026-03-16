"use client"

import { Fragment, useState } from "react"
import { useRouter } from "next/navigation"
import { CaretRight, CaretDown, Check, Link as LinkIcon, Plus, X } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import eventsData from "@/data/events.json"
import { ResponsiveTableShell } from "@/components/responsive-table-shell"

type EventWithDays = (typeof eventsData)[0] & {
  days?: Array<{
    label: string
    date: string
    participants: number
    paid: number
    cash: number
    wynajmuje: number
    listaRezerwowa: number
  }>
}

export default function DashboardEventsPage() {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [linkModalEvent, setLinkModalEvent] = useState<{ name: string; url: string } | null>(null)
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null)
  const [expandedMobileId, setExpandedMobileId] = useState<string | null>(null)

  const openLinkModal = (e: React.MouseEvent, event: EventWithDays) => {
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

  const toggleExpandDesktop = (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation()
    setExpandedEventId((prev) => (prev === eventId ? null : eventId))
  }

  const toggleExpandMobile = (eventId: string) => {
    setExpandedMobileId((prev) => (prev === eventId ? null : eventId))
  }

  const goToFullEvent = (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation()
    router.push(`/dashboard/${eventId}`)
  }

  const goToDayEvent = (e: React.MouseEvent, eventId: string, dayIndex: number) => {
    e.stopPropagation()
    router.push(`/dashboard/${eventId}?dzien=${dayIndex + 1}`)
  }

  const desktopTable = (
    <div className="rounded-lg border border-border bg-card">
      <table className="w-full min-w-[700px] table-fixed text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="w-[4%] px-1 py-1.5" />
            <th className="w-[14%] px-3 py-1.5 text-left font-medium">Wydarzenie</th>
            <th className="w-[10%] px-3 py-1.5 text-left font-medium">Data</th>
            <th className="w-[10%] px-3 py-1.5 text-left font-medium">Uczestnicy</th>
            <th className="w-[10%] px-3 py-1.5 text-left font-medium">Opłacone</th>
            <th className="w-[10%] px-3 py-1.5 text-left font-medium">Gotówka</th>
            <th className="w-[10%] px-3 py-1.5 text-left font-medium">Wynajmy</th>
            <th className="w-[8%] px-3 py-1.5 text-left font-medium">Rezerwa</th>
            <th className="w-[24%] px-3 py-1.5 text-right" />
          </tr>
        </thead>
        <tbody>
          {(eventsData as EventWithDays[]).map((event) => {
            const isExpanded = expandedEventId === event.id
            const days = event.days ?? []
            return (
              <Fragment key={event.id}>
                <tr
                  onClick={(e) => toggleExpandDesktop(e, event.id)}
                  className={cn(
                    "group cursor-pointer border-b border-border transition-colors even:bg-muted/40 hover:bg-muted/50",
                    isExpanded && "bg-muted/30"
                  )}
                >
                  <td className="px-1 py-1.5">
                    <span className="inline-flex text-muted-foreground">
                      {isExpanded ? (
                        <CaretDown className="size-4" weight="bold" />
                      ) : (
                        <CaretRight className="size-4" weight="bold" />
                      )}
                    </span>
                  </td>
                  <td className="px-3 py-1.5">
                    <span className="block truncate font-medium">{event.name}</span>
                  </td>
                  <td className="truncate px-3 py-1.5 text-muted-foreground">{event.date}</td>
                  <td className="px-3 py-1.5">
                    <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {event.participants}/{event.maxCapacity ?? 80}
                    </span>
                  </td>
                  <td className="px-3 py-1.5">
                    <span className="rounded-lg bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      {event.paid ?? 0}/{event.maxCapacity ?? 80}
                    </span>
                  </td>
                  <td className="px-3 py-1.5">
                    <span className="rounded-lg bg-blue-500/15 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400">
                      {event.cash ?? 0}/{event.maxCapacity ?? 80}
                    </span>
                  </td>
                  <td className="px-3 py-1.5">
                    <span className="rounded-lg bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                      {event.wynajmuje ?? 0}/{event.maxWynajmuje ?? 10}
                    </span>
                  </td>
                  <td className="px-3 py-1.5">
                    <span className="text-muted-foreground">
                      {(event.listaRezerwowa ?? 0) > 0 ? (event.listaRezerwowa ?? 0) : "–"}
                    </span>
                  </td>
                  <td className="px-3 py-1.5 text-right" onClick={(e) => e.stopPropagation()}>
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
                        onClick={(e) => goToFullEvent(e, event.id)}
                      >
                        Wyświetl
                        <CaretRight className="size-4" weight="bold" />
                      </Button>
                    </div>
                  </td>
                </tr>
                {isExpanded && days.length > 0 && (
                  <tr key={`${event.id}-expand`}>
                    <td colSpan={9} className="p-0 align-top">
                      <div className="border-t border-border bg-muted/5">
                        <div className="ml-5 mr-2 border-l border-border py-2 pl-4 pr-2">
                          <table className="w-full table-fixed text-sm">
                            <colgroup>
                              <col className="w-[4%]" />
                              <col className="w-[14%]" />
                              <col className="w-[10%]" />
                              <col className="w-[10%]" />
                              <col className="w-[10%]" />
                              <col className="w-[10%]" />
                              <col className="w-[10%]" />
                              <col className="w-[8%]" />
                              <col className="w-[24%]" />
                            </colgroup>
                            <tbody>
                              {days.map((day, dayIndex) => (
                                <tr
                                  key={dayIndex}
                                  onClick={() =>
                                    router.push(`/dashboard/${event.id}?dzien=${dayIndex + 1}`)
                                  }
                                  className="cursor-pointer border-b border-border/60 last:border-0 even:bg-muted/10 hover:bg-muted/20 transition-colors"
                                >
                                  <td className="w-[4%] px-1 py-1.5" />
                                  <td className="w-[14%] px-3 py-1.5 font-medium text-muted-foreground">
                                    {day.label}
                                  </td>
                                  <td className="w-[10%] px-3 py-1.5 text-muted-foreground">
                                    {day.date}
                                  </td>
                                  <td className="w-[10%] px-3 py-1.5">
                                    <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                      {day.participants}/{event.maxCapacity ?? 80}
                                    </span>
                                  </td>
                                  <td className="w-[10%] px-3 py-1.5">
                                    <span className="rounded-lg bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                      {day.paid}/{event.maxCapacity ?? 80}
                                    </span>
                                  </td>
                                  <td className="w-[10%] px-3 py-1.5">
                                    <span className="rounded-lg bg-blue-500/15 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400">
                                      {day.cash}/{event.maxCapacity ?? 80}
                                    </span>
                                  </td>
                                  <td className="w-[10%] px-3 py-1.5">
                                    <span className="rounded-lg bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                                      {day.wynajmuje}/{event.maxWynajmuje ?? 10}
                                    </span>
                                  </td>
                                  <td className="w-[8%] px-3 py-1.5">
                                    <span className="text-muted-foreground">
                                      {day.listaRezerwowa > 0 ? day.listaRezerwowa : "–"}
                                    </span>
                                  </td>
                                  <td
                                    className="w-[24%] px-3 py-1.5 text-right"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => goToDayEvent(e, event.id, dayIndex)}
                                    >
                                      Wyświetl
                                      <CaretRight className="size-4" weight="bold" />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )

  const mobileList = (
    <div className="space-y-3">
      {(eventsData as EventWithDays[]).map((event) => {
        const isExpanded = expandedMobileId === event.id
        const days = event.days ?? []
        const hasForm = !!(event as { formularzRejestracyjny?: string }).formularzRejestracyjny
        return (
          <div
            key={event.id}
            className="rounded-xl border border-border bg-card p-3 shadow-sm active:bg-muted/40"
          >
            <button
              type="button"
              onClick={() => toggleExpandMobile(event.id)}
              className="flex w-full items-start justify-between gap-3 text-left"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {isExpanded ? (
                      <CaretDown className="size-4" weight="bold" />
                    ) : (
                      <CaretRight className="size-4" weight="bold" />
                    )}
                  </span>
                  <span className="truncate text-sm font-semibold">{event.name}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                  <span>{event.date}</span>
                  <span className="mx-1 text-muted-foreground/50">•</span>
                  <span>
                    {event.participants}/{event.maxCapacity ?? 80} uczestników
                  </span>
                  <span className="mx-1 text-muted-foreground/50">•</span>
                  <span>
                    {event.wynajmuje ?? 0}/{event.maxWynajmuje ?? 10} wynajmy
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                  {event.paid ?? 0}/{event.maxCapacity ?? 80} opłacone
                </span>
                <span className="rounded-lg bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:text-blue-400">
                  {event.cash ?? 0} gotówka
                </span>
              </div>
            </button>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 min-w-[8rem]"
                onClick={() => router.push(`/dashboard/${event.id}`)}
              >
                Szczegóły
                <CaretRight className="size-4" weight="bold" />
              </Button>
              {hasForm && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 min-w-[8rem]"
                  onClick={(e) => openLinkModal(e, event as EventWithDays)}
                >
                  link rej.
                  <LinkIcon className="size-4" weight="bold" />
                </Button>
              )}
            </div>

            {isExpanded && (
              <div className="mt-3 space-y-2 border-t border-border/60 pt-2">
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <span className="rounded-lg bg-primary/10 px-2 py-0.5 font-medium text-primary">
                    Uczestnicy: {event.participants}/{event.maxCapacity ?? 80}
                  </span>
                  <span className="rounded-lg bg-emerald-500/15 px-2 py-0.5 font-medium text-emerald-700 dark:text-emerald-400">
                    Opłacone: {event.paid ?? 0}
                  </span>
                  <span className="rounded-lg bg-blue-500/15 px-2 py-0.5 font-medium text-blue-700 dark:text-blue-400">
                    Gotówka: {event.cash ?? 0}
                  </span>
                  <span className="rounded-lg bg-amber-500/15 px-2 py-0.5 font-medium text-amber-700 dark:text-amber-400">
                    Wynajmy: {event.wynajmuje ?? 0}/{event.maxWynajmuje ?? 10}
                  </span>
                  <span className="rounded-lg bg-slate-500/10 px-2 py-0.5 font-medium text-slate-700 dark:text-slate-300">
                    Rezerwa: {(event.listaRezerwowa ?? 0) > 0 ? event.listaRezerwowa : "–"}
                  </span>
                </div>

                {days.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Dni wydarzenia</p>
                    <div className="flex flex-col gap-1.5">
                      {days.map((day, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => goToDayEvent(e, event.id, idx)}
                          className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs active:bg-muted/40"
                        >
                          <div className="flex flex-col text-left">
                            <span className="font-medium">{day.label}</span>
                            <span className="text-[11px] text-muted-foreground">{day.date}</span>
                          </div>
                          <CaretRight className="size-4 text-muted-foreground" weight="bold" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
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
                  copied &&
                    "bg-emerald-600 text-white hover:bg-emerald-600 hover:text-white dark:bg-emerald-600 dark:hover:bg-emerald-600"
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
              Udostępnij ten link uczestnikom, aby mogli się zarejestrować na wydarzenie „
              {linkModalEvent.name}”.
            </span>
          </div>
        </>
      )}

      <ResponsiveTableShell
        title="Wydarzenia"
        actions={
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/nowe-wydarzenie")}>
            <Plus className="size-4" weight="bold" />
            Dodaj wydarzenie
          </Button>
        }
        desktopTable={desktopTable}
        mobileList={mobileList}
      />
    </div>
  )
}

