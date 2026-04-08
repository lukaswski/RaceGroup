"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import {
  IdentificationCard,
  Motorcycle,
  FileText,
  Phone,
  X,
  CaretDown,
  CaretLeft,
  CaretRight,
  PencilSimple,
  CurrencyCircleDollar,
  ArrowLeft,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import participantsData from "@/data/participants.json"
import participantsByEvent from "@/data/participants-by-event.json"
import eventsData from "@/data/events.json"

type EventWithDays = (typeof eventsData)[0] & {
  days?: Array<{ label: string; date: string }>
}
type ParticipantStatus = "opłacony" | "oczekuje" | "gotówka" | "zaliczka"

const GROUPS = ["A", "B", "C", "D", "listaRezerwowa"] as const
type GroupKey = (typeof GROUPS)[number]
const GROUP_LABELS: Record<string, string> = {
  A: "Grupa A",
  B: "Grupa B",
  C: "Grupa C",
  D: "Grupa D",
  listaRezerwowa: "Rezerwa",
}

type LapTimeRange = { minSeconds: number; maxSeconds: number }
const LAP_TIME_RANGES: Partial<Record<(typeof GROUPS)[number], LapTimeRange>> = {
  A: { minSeconds: 105, maxSeconds: 110 }, // 1:45–1:50
  B: { minSeconds: 110, maxSeconds: 125 }, // 1:50–2:05
  C: { minSeconds: 125, maxSeconds: 140 }, // 2:05–2:20
  D: { minSeconds: 140, maxSeconds: 150 }, // 2:20–2:30
}

function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.trunc(n)))
}

function toSecondsLabel(totalSeconds: number) {
  const s = clampInt(totalSeconds, 0, 60 * 60)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, "0")}`
}

function stableUnitRandom(seed: string) {
  // Deterministyczne pseudo-losowanie 0..1 na podstawie stringa (bez zależności).
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  // 0..1 (wykorzystujemy 24 bity dla stabilności)
  return ((h >>> 0) & 0xffffff) / 0x1000000
}

function getLapTimeLabel(args: {
  participantId: string
  effectiveGroup: (typeof GROUPS)[number]
  eventDayIndex: number
}) {
  const range = LAP_TIME_RANGES[args.effectiveGroup]
  if (!range) return "brak"

  const rMissing = stableUnitRandom(`lap-missing:${args.participantId}:${args.eventDayIndex}`)
  if (rMissing < 0.18) return "brak"

  const r = stableUnitRandom(`lap:${args.participantId}:${args.eventDayIndex}:${args.effectiveGroup}`)
  const seconds =
    range.minSeconds + Math.round(r * (range.maxSeconds - range.minSeconds))
  return toSecondsLabel(seconds)
}

export default function EventParticipantsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const eventId = params.eventId as string
  const event = eventsData.find((e) => e.id === eventId) as EventWithDays | undefined
  const dzienParam = searchParams.get("dzien")
  const dayIndex = dzienParam ? Math.max(0, parseInt(dzienParam, 10) - 1) : null
  const eventDays = event?.days ?? []
  const daysToShow =
    dayIndex !== null && eventDays[dayIndex]
      ? [eventDays[dayIndex]]
      : eventDays.length > 0
        ? eventDays
        : [{ label: "Dzień 1", date: (event?.date as string)?.split("-")[0]?.trim() ?? "–" }]

  const eventParticipants = (participantsByEvent as Record<string, Array<typeof participantsData[0]>>)[eventId]
  const participants = eventParticipants ?? participantsData

  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null)
  const [isDrawerCollapsed, setIsDrawerCollapsed] = useState(false)
  // Klucze "dayIdx-group" – rozwinięta grupa tylko dla danego dnia
  const [expandedGroupsByDay, setExpandedGroupsByDay] = useState<Set<string>>(new Set())
  const [groupOverrides, setGroupOverrides] = useState<Record<string, GroupKey>>({})
  const [centerAlertText, setCenterAlertText] = useState<string | null>(null)
  const alertTimerRef = useRef<number | null>(null)

  const toGroupKey = (g: string): GroupKey => {
    return (GROUPS as readonly string[]).includes(g) ? (g as GroupKey) : "listaRezerwowa"
  }

  const getEffectiveGroup = (p: (typeof participants)[0]): GroupKey =>
    groupOverrides[p.id] ?? toGroupKey(p.group)

  const participantsWithGroup = participants.map((p) => ({
    ...p,
    effectiveGroup: getEffectiveGroup(p),
  }))

  const selectedParticipant = participants.find((p) => p.id === selectedParticipantId)

  const showCenterAlert = (text: string) => {
    setCenterAlertText(text)
    if (alertTimerRef.current) window.clearTimeout(alertTimerRef.current)
    alertTimerRef.current = window.setTimeout(() => setCenterAlertText(null), 1200)
  }

  useEffect(() => {
    // Na desktopie/tablecie panel boczny ma być zawsze otwarty.
    // Ustawiamy domyślnie pierwszego uczestnika tylko dla szerokich ekranów,
    // żeby na mobile nie otwierać drawer'a automatycznie.
    if (!selectedParticipantId && participants.length > 0) {
      const mq = window.matchMedia?.("(min-width: 768px)")
      if (mq?.matches) setSelectedParticipantId(participants[0]!.id)
    }

    return () => {
      if (alertTimerRef.current) window.clearTimeout(alertTimerRef.current)
    }
  }, [participants, selectedParticipantId])

  const setParticipantGroup = (participantId: string, newGroup: GroupKey) => {
    setGroupOverrides((prev) => ({ ...prev, [participantId]: newGroup }))
    showCenterAlert("Grupa zmieniona")
  }

  const openDrawer = (participantId: string) => setSelectedParticipantId(participantId)
  const closeDrawer = () => setSelectedParticipantId(null)

  const eventTotalDays = Math.max(eventDays.length, 1)
  const isPresentOnDay = (p: (typeof participants)[0], eventDayIndex: number) => {
    const obecnyWDniach = (p as { obecnyWDniach?: number[] }).obecnyWDniach
    const dni = (p as { dniObecnosci?: number }).dniObecnosci ?? eventTotalDays
    if (obecnyWDniach && obecnyWDniach.length > 0) return obecnyWDniach.includes(eventDayIndex)
    return eventDayIndex < dni
  }

  const getStatusStyles = (status: ParticipantStatus) => {
    switch (status) {
      case "opłacony":
        return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
      case "oczekuje":
        return "bg-amber-500/15 text-amber-700 dark:text-amber-400"
      case "gotówka":
        return "bg-blue-500/15 text-blue-700 dark:text-blue-400"
      case "zaliczka":
        return "bg-violet-500/15 text-violet-700 dark:text-violet-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const exportToExcel = () => {
    if (!event) return
    const visibleParticipants = participantsWithGroup.filter((p) =>
      daysToShow.some((_, dayIdx) =>
        isPresentOnDay(p, dayIndex !== null ? dayIndex : dayIdx)
      )
    )
    const groupOrder = (g: string) => {
      const i = GROUPS.indexOf(g as (typeof GROUPS)[number])
      return i >= 0 ? i : 999
    }
    const sortedByGroup = [...visibleParticipants].sort((a, b) => {
      const ga = getEffectiveGroup(a)
      const gb = getEffectiveGroup(b)
      if (groupOrder(ga) !== groupOrder(gb))
        return groupOrder(ga) - groupOrder(gb)
      return (a.surname ?? "").localeCompare(b.surname ?? "", "pl")
    })
    const escapeCsv = (v: string) => {
      const s = String(v ?? "")
      if (/[,"\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
      return s
    }
    const headers = [
      "Grupa",
      "Imię",
      "Nazwisko",
      "Email",
      "Telefon",
      "Motocykl",
      "Czas okrążenia",
      "Status",
      "Podpis",
    ]
    const rowForParticipant = (p: (typeof visibleParticipants)[0]) => [
      GROUP_LABELS[getEffectiveGroup(p)] ?? p.group,
      p.name,
      p.surname,
      (p as { email?: string }).email ?? "",
      (p as { phone?: string }).phone ?? "",
      (p as { rentsMotorcycle?: boolean }).rentsMotorcycle ? "" : p.motorcycle ?? "",
      getLapTimeLabel({
        participantId: p.id,
        effectiveGroup: getEffectiveGroup(p) as (typeof GROUPS)[number],
        eventDayIndex: dayIndex ?? 0,
      }),
      p.status ?? "",
      "",
    ]
    const rows: string[][] = []
    let lastGroup: string | null = null
    for (const p of sortedByGroup) {
      const g = getEffectiveGroup(p)
      if (g !== lastGroup) {
        lastGroup = g
        rows.push([GROUP_LABELS[g] ?? g, "", "", "", "", "", "", "", ""])
      }
      rows.push(rowForParticipant(p))
    }
    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.map(escapeCsv).join(","))].join("\r\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${event.name.replace(/\s+/g, "-")}-uczestnicy.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!event) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-muted-foreground">
        <p>Wydarzenie nie znalezione</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-4 sm:p-6">
      {centerAlertText && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center pointer-events-none"
          aria-live="polite"
          aria-atomic="true"
          role="status"
        >
          <div
            className={cn(
              "translate-y-[-2.5rem] rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-lg backdrop-blur",
              "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
            )}
          >
            {centerAlertText}
          </div>
        </div>
      )}
      <div className="mb-4 flex shrink-0 flex-col gap-3">
        <Link
          href="/dashboard"
          className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" weight="bold" />
          Cofnij
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="truncate text-base font-semibold sm:text-lg">{event.name}</h1>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary w-fit">
                {event.participants}/{event.maxCapacity ?? 80} uczestników
              </span>
              <span className="rounded-lg bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 w-fit">
                {event.paid ?? 0}/{event.maxCapacity ?? 80} opłacone
              </span>
              <span className="rounded-lg bg-blue-500/15 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 w-fit">
                {event.cash ?? 0}/{event.maxCapacity ?? 80} gotówka
              </span>
              <span className="rounded-lg bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 w-fit">
                {event.wynajmuje ?? 0}/{event.maxWynajmuje ?? 10} wynajmy
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 sm:pl-4">
            <span className="text-sm text-muted-foreground">{event.date}</span>
            {dayIndex !== null && (
              <Link
                href={`/dashboard/${eventId}`}
                className="text-xs text-primary underline hover:no-underline"
              >
                Pokaż wszystkie dni
              </Link>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-fit shrink-0"
                onClick={() => {}}
              >
                <PencilSimple className="size-4" weight="bold" />
                Edytuj wydarzenie
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-fit shrink-0"
                onClick={exportToExcel}
              >
                Pobierz do pliku Excel
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:items-stretch">
        <div className="min-w-0 flex-1 space-y-4 overflow-auto lg:space-y-5 lg:min-h-0">
          {daysToShow.map((day, dayIdx) => {
            const currentEventDayIndex = dayIndex !== null ? dayIndex : dayIdx
            return (
            <div key={dayIdx} className="space-y-2 lg:space-y-3">
              <h2 className="sticky top-0 z-10 bg-background/95 py-1 text-sm font-semibold text-muted-foreground backdrop-blur supports-[backdrop-filter]:bg-background/80">
                Dzień {dayIdx + 1} – {day.date}
              </h2>
              {GROUPS.map((group) => {
                const groupParticipants = participantsWithGroup.filter(
                  (p) => p.effectiveGroup === group && isPresentOnDay(p, currentEventDayIndex)
                )
                const dayGroupKey = `${dayIdx}-${group}`
                const isCollapsed = !expandedGroupsByDay.has(dayGroupKey)
                const isSelectedParticipantHere =
                  !isCollapsed
                    ? false
                    : selectedParticipantId &&
                      selectedParticipant &&
                      getEffectiveGroup(selectedParticipant) === group &&
                      isPresentOnDay(selectedParticipant, currentEventDayIndex)
                const toggleGroup = () => {
                  setExpandedGroupsByDay((prev) => {
                    const next = new Set(prev)
                    if (next.has(dayGroupKey)) next.delete(dayGroupKey)
                    else next.add(dayGroupKey)
                    return next
                  })
                }
                const isListaRezerwowa = group === "listaRezerwowa"
                const maxPerGroup = isListaRezerwowa ? null : 20
                const wynajmujeInGroup = groupParticipants.filter(
                  (p) => (p as { rentsMotorcycle?: boolean }).rentsMotorcycle
                ).length
                return (
                  <div
                    key={dayGroupKey}
                    className={cn(
                      "rounded-lg border border-border bg-card",
                      isSelectedParticipantHere && "border-l-4 border-l-primary"
                    )}
                  >
                <button
                  type="button"
                  onClick={toggleGroup}
                  className="flex w-full cursor-pointer items-center justify-between border-b border-border bg-muted/50 px-4 py-2.5 text-left transition-colors hover:bg-muted/70"
                  title={isCollapsed ? "Rozwiń tabelę" : "Zwiń tabelę"}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold">{GROUP_LABELS[group] ?? `Grupa ${group}`}</h3>
                    <span className={cn(
                      "rounded-lg px-2 py-0.5 text-xs font-medium",
                      isListaRezerwowa
                        ? "bg-teal-500/15 text-teal-700 dark:text-teal-400"
                        : "bg-primary/10 text-primary"
                    )}>
                      {isListaRezerwowa
                        ? `${groupParticipants.length} oczekujących`
                        : `${groupParticipants.length} / ${maxPerGroup}`}
                    </span>
                    {wynajmujeInGroup > 0 && (
                      <span className="rounded-lg bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                        {wynajmujeInGroup}
                      </span>
                    )}
                  </div>
                  {isCollapsed ? (
                    <CaretRight className="size-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <CaretDown className="size-4 shrink-0 text-muted-foreground" />
                  )}
                </button>
                {!isCollapsed && (
                  <>
                    <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[560px] table-fixed text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="w-[6%] px-2 py-2 text-left font-medium">Lp.</th>
                          <th className="w-[24%] px-3 py-2 text-left font-medium">Uczestnik</th>
                          <th className="w-[22%] px-3 py-2 text-left font-medium">Motocykl</th>
                          <th className="w-[10%] px-3 py-2 text-left font-medium">Czas okrążenia</th>
                          <th className="w-[14%] px-3 py-2 text-left font-medium">Status</th>
                          <th className="w-[24%] px-3 py-2" />
                        </tr>
                      </thead>
                      <tbody>
                        {groupParticipants.map((p, idx) => (
                          <tr
                            key={p.id}
                            onClick={() => openDrawer(p.id)}
                            className={cn(
                              "cursor-pointer border-b border-border last:border-0 transition-colors",
                              selectedParticipantId === p.id
                                ? "bg-primary/10"
                                : idx % 2 === 0
                                  ? "bg-background hover:bg-muted/20"
                                  : "bg-muted/15 hover:bg-muted/25"
                            )}
                          >
                            <td
                              className={cn(
                                "px-2 py-2 text-muted-foreground tabular-nums",
                                selectedParticipantId === p.id && "border-l-4 border-l-primary pl-2"
                              )}
                            >
                              {idx + 1}
                            </td>
                            <td className="px-3 py-2">
                              <span className="block truncate font-medium">
                                {p.name} {p.surname}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-muted-foreground">
                              {p.rentsMotorcycle ? (
                                <span className="inline-flex w-fit shrink-0 rounded-lg bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                  ninja 400
                                </span>
                              ) : (
                                <span className="block truncate">{p.motorcycle}</span>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              <span className="tabular-nums text-muted-foreground">
                                {getLapTimeLabel({
                                  participantId: p.id,
                                  effectiveGroup: p.effectiveGroup,
                                  eventDayIndex: currentEventDayIndex,
                                })}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className={cn(
                                  "inline-flex rounded-lg px-2 py-0.5 text-xs font-medium capitalize",
                                  getStatusStyles(p.status as ParticipantStatus)
                                )}
                              >
                                {p.status}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              <div
                                className="flex items-center gap-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <select
                                  value={p.effectiveGroup}
                                  onChange={(e) => setParticipantGroup(p.id, toGroupKey(e.target.value))}
                                  className={cn(
                                    "h-7 w-[6.5rem] rounded-md border border-input bg-transparent px-2 py-1 text-xs font-medium",
                                    "text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                                    "cursor-pointer hover:bg-muted/50"
                                  )}
                                  title="Zmień grupę"
                                >
                                  {GROUPS.map((g) => (
                                    <option key={g} value={g}>
                                      {GROUP_LABELS[g]}
                                    </option>
                                  ))}
                                </select>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-muted-foreground hover:text-foreground shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openDrawer(p.id)
                                  }}
                                >
                                  Wyświetl
                                  <CaretRight className="size-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                    <div className="flex flex-col gap-2 p-3 md:hidden">
                      {groupParticipants.map((p, idx) => (
                        <div
                          key={p.id}
                          onClick={() => openDrawer(p.id)}
                          className={cn(
                            "flex flex-col gap-2 rounded-lg border border-border p-3 transition-colors",
                            selectedParticipantId === p.id
                              ? "bg-primary/10 border-l-4 border-l-primary"
                              : idx % 2 === 0
                                ? "bg-background active:bg-muted/20"
                                : "bg-muted/15 active:bg-muted/25"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-muted-foreground tabular-nums">{idx + 1}.</span>
                            <span className="font-medium">
                              {p.name} {p.surname}
                            </span>
                            <span
                              className={cn(
                                "shrink-0 rounded-lg px-2 py-0.5 text-xs font-medium capitalize",
                                getStatusStyles(p.status as ParticipantStatus)
                              )}
                            >
                              {p.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            {p.rentsMotorcycle ? (
                              <span className="rounded-lg bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                ninja 400
                              </span>
                            ) : (
                              <span>{p.motorcycle}</span>
                            )}
                            <span className="text-muted-foreground/50">•</span>
                            <span className="tabular-nums">
                              {getLapTimeLabel({
                                participantId: p.id,
                                effectiveGroup: p.effectiveGroup,
                                eventDayIndex: currentEventDayIndex,
                              })}
                            </span>
                          </div>
                          <div
                            className="mt-1 flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="shrink-0 text-sm text-muted-foreground">Grupa</span>
                            <select
                              value={p.effectiveGroup}
                              onChange={(e) => setParticipantGroup(p.id, toGroupKey(e.target.value))}
                              className={cn(
                                "h-9 flex-1 min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-sm font-medium",
                                "text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                                "cursor-pointer hover:bg-muted/50"
                              )}
                              title="Zmień grupę"
                            >
                              {GROUPS.map((g) => (
                                <option key={g} value={g}>
                                  {GROUP_LABELS[g]}
                                </option>
                              ))}
                            </select>
                            <Button
                              variant="outline"
                              size="sm"
                              className="shrink-0 text-muted-foreground hover:text-foreground"
                              onClick={(e) => {
                                e.stopPropagation()
                                openDrawer(p.id)
                              }}
                            >
                              Wyświetl
                              <CaretRight className="size-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )
          })}
            </div>
          )
          })}
        </div>

        <>
          {selectedParticipant && (
            <div
              className="fixed inset-0 z-[55] bg-black/50 backdrop-blur-sm md:hidden"
              onClick={closeDrawer}
              aria-hidden="true"
            />
          )}
          <aside
            className={cn(
              "relative flex flex-col overflow-hidden bg-card transition-all duration-200",
              // mobile: tylko gdy wybrano uczestnika
              selectedParticipant ? "fixed inset-0 z-[60] flex rounded-none md:static md:z-auto" : "hidden md:flex",
              // desktop/tablet: zawsze widoczne
              "md:inset-auto md:w-96 md:rounded-xl md:border md:border-border md:shadow-lg md:min-h-0",
              "lg:self-stretch lg:mt-10",
              isDrawerCollapsed ? "md:w-14" : ""
            )}
          >
              <button
                onClick={() => setIsDrawerCollapsed((v) => !v)}
                className={cn(
                  "absolute -left-4 top-1/2 z-10 hidden h-8 w-6 -translate-y-1/2 items-center justify-center rounded-l-xl border border-r-0 border-border bg-card shadow-sm transition-colors hover:bg-primary/10 hover:border-primary/20 lg:flex",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                )}
                title={isDrawerCollapsed ? "Rozwiń panel" : "Zwiń panel"}
              >
                {isDrawerCollapsed ? (
                  <CaretLeft className="size-4 text-muted-foreground" />
                ) : (
                  <CaretRight className="size-4 text-muted-foreground" />
                )}
              </button>
              <div
                className={cn(
                  "flex h-10 shrink-0 items-center border-b border-border bg-muted/30",
                  isDrawerCollapsed ? "flex-col justify-center gap-1 py-2" : "justify-between px-4"
                )}
              >
                {isDrawerCollapsed ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setIsDrawerCollapsed(false)}
                      title="Rozwiń panel"
                    >
                      <CaretRight className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={closeDrawer}
                      title="Zamknij"
                      className="md:hidden"
                    >
                      <X className="size-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold">Szczegóły uczestnika</h3>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setIsDrawerCollapsed(true)}
                        title="Zwiń do ikon"
                      >
                        <CaretLeft className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={closeDrawer}
                        title="Zamknij"
                        className="md:hidden"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
              {!isDrawerCollapsed && selectedParticipant && (
                <div className="min-h-0 flex-1 space-y-6 overflow-auto px-4 py-4">
                  <section className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <IdentificationCard className="size-4" />
                      <span>Dane osobowe</span>
                      <span
                        className={cn(
                          "rounded-lg px-2 py-0.5 text-xs font-medium normal-case",
                          getEffectiveGroup(selectedParticipant) === "listaRezerwowa"
                            ? "bg-teal-500/15 text-teal-700 dark:text-teal-400"
                            : "bg-primary/10 text-primary"
                        )}
                      >
                        {GROUP_LABELS[getEffectiveGroup(selectedParticipant)] ??
                          `Grupa ${getEffectiveGroup(selectedParticipant)}`}
                      </span>
                    </h4>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between gap-2">
                        <dt className="shrink-0 text-muted-foreground">Imię i nazwisko</dt>
                        <dd className="text-right">
                          {selectedParticipant.name} {selectedParticipant.surname}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="shrink-0 text-muted-foreground">Email</dt>
                        <dd className="text-right">{selectedParticipant.email}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="shrink-0 text-muted-foreground">Nr tel</dt>
                        <dd className="text-right">{(selectedParticipant as { phone?: string }).phone ?? "–"}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="shrink-0 text-muted-foreground">Nr tel osoby bliskiej</dt>
                        <dd className="text-right">
                          {(selectedParticipant as { phoneBliskiej?: string }).phoneBliskiej ?? "–"}
                        </dd>
                      </div>
                    </dl>
                  </section>
                  <section className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Motorcycle className="size-4" />
                      Motocykl
                      {selectedParticipant.rentsMotorcycle && (
                        <span className="rounded-lg bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                          ninja 400
                        </span>
                      )}
                    </h4>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between gap-2">
                        <dt className="shrink-0 text-muted-foreground">Pojazd</dt>
                        <dd className="text-right">
                          {selectedParticipant.rentsMotorcycle ? "–" : selectedParticipant.motorcycle}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="shrink-0 text-muted-foreground">Opis</dt>
                        <dd className="text-right text-muted-foreground">
                          {selectedParticipant.rentsMotorcycle ? "–" : "tekst dodany przez uczestnika podczas rejestracji"}
                        </dd>
                      </div>
                    </dl>
                  </section>
                  <section className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <CurrencyCircleDollar className="size-4" />
                      Płatności
                    </h4>
                    <dl className="space-y-2 text-sm">
                      {(() => {
                        const p = selectedParticipant
                        const dni = (p as { dniObecnosci?: number }).dniObecnosci ?? eventTotalDays
                        const obecnyWDniach = (p as { obecnyWDniach?: number[] }).obecnyWDniach
                        const dayIndices = obecnyWDniach?.length
                          ? obecnyWDniach
                          : Array.from({ length: Math.min(dni, eventDays.length) }, (_, i) => i)
                        const status = (p.status ?? "oczekuje") as ParticipantStatus
                        return (
                          <>
                            {dayIndices.map((i) => {
                              const date = eventDays[i]?.date ?? "–"
                              return (
                                <div key={i} className="flex justify-between items-center gap-2">
                                  <dt className="shrink-0 text-muted-foreground">Uczestnictwo: {date}</dt>
                                  <dd className="text-right">
                                    <span
                                      className={cn(
                                        "inline-flex rounded-lg px-2 py-0.5 text-xs font-medium capitalize",
                                        getStatusStyles(status)
                                      )}
                                    >
                                      {status}
                                    </span>
                                  </dd>
                                </div>
                              )
                            })}
                            {p.rentsMotorcycle && (
                              <div className="flex justify-between items-center gap-2">
                                <dt className="shrink-0 text-muted-foreground">Wynajem motocykla</dt>
                                <dd className="text-right">
                                  <span
                                    className={cn(
                                      "inline-flex rounded-lg px-2 py-0.5 text-xs font-medium capitalize",
                                      getStatusStyles(status)
                                    )}
                                  >
                                    {status}
                                  </span>
                                </dd>
                              </div>
                            )}
                          </>
                        )
                      })()}
                    </dl>
                  </section>
                  <section className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <FileText className="size-4" />
                      Oświadczenia
                    </h4>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between items-center gap-2">
                        <dt className="shrink-0 text-muted-foreground">Regulamin</dt>
                        <dd className="text-right">
                          <span className="inline-flex rounded-lg bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-700 dark:text-emerald-400">
                            Zaakceptowano
                          </span>
                        </dd>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <dt className="shrink-0 text-muted-foreground">Zgoda na udział</dt>
                        <dd className="text-right">
                          <span className="inline-flex rounded-lg bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-700 dark:text-emerald-400">
                            Podpisana
                          </span>
                        </dd>
                      </div>
                    </dl>
                  </section>
                </div>
              )}
              {isDrawerCollapsed && (
                <nav className="flex flex-1 flex-col items-center gap-2 py-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Dane osobowe"
                    className="text-muted-foreground"
                    onClick={() => setIsDrawerCollapsed(false)}
                  >
                    <IdentificationCard className="size-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Motocykl"
                    className="text-muted-foreground"
                    onClick={() => setIsDrawerCollapsed(false)}
                  >
                    <Motorcycle className="size-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Płatności"
                    className="text-muted-foreground"
                    onClick={() => setIsDrawerCollapsed(false)}
                  >
                    <CurrencyCircleDollar className="size-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Nr tel"
                    className="text-muted-foreground"
                    onClick={() => setIsDrawerCollapsed(false)}
                  >
                    <Phone className="size-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Oświadczenia"
                    className="text-muted-foreground"
                    onClick={() => setIsDrawerCollapsed(false)}
                  >
                    <FileText className="size-5" />
                  </Button>
                </nav>
              )}
              {!isDrawerCollapsed && !selectedParticipant && (
                <div className="min-h-0 flex-1 p-6 text-sm text-muted-foreground hidden md:block">
                  Wybierz uczestnika z listy, aby zobaczyć szczegóły.
                </div>
              )}
            </aside>
        </>
      </div>
    </div>
  )
}
