"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
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
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import participantsData from "@/data/participants.json"
import participantsByEvent from "@/data/participants-by-event.json"
import eventsData from "@/data/events.json"

type ParticipantStatus = "opłacony" | "oczekuje" | "gotówka" | "zaliczka"

const GROUPS = ["A", "B", "C", "D", "listaRezerwowa"] as const
const GROUP_LABELS: Record<string, string> = {
  A: "Grupa A",
  B: "Grupa B",
  C: "Grupa C",
  D: "Grupa D",
  listaRezerwowa: "Rezerwa",
}

export default function EventParticipantsPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.eventId as string
  const event = eventsData.find((e) => e.id === eventId)

  const eventParticipants = (participantsByEvent as Record<string, Array<typeof participantsData[0]>>)[eventId]
  const participants = eventParticipants ?? participantsData

  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null)
  const [isDrawerCollapsed, setIsDrawerCollapsed] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set(GROUPS))
  const [groupOverrides, setGroupOverrides] = useState<Record<string, string>>({})

  const getEffectiveGroup = (p: (typeof participants)[0]) => groupOverrides[p.id] ?? p.group
  const participantsWithGroup = participants.map((p) => ({ ...p, effectiveGroup: getEffectiveGroup(p) }))

  const selectedParticipant = participants.find((p) => p.id === selectedParticipantId)

  const setParticipantGroup = (participantId: string, newGroup: string) => {
    setGroupOverrides((prev) => ({ ...prev, [participantId]: newGroup }))
  }

  const openDrawer = (participantId: string) => setSelectedParticipantId(participantId)
  const closeDrawer = () => setSelectedParticipantId(null)

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

  if (!event) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-muted-foreground">
        <p>Wydarzenie nie znalezione</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-4 sm:p-6">
      <div className="mb-4 flex shrink-0 flex-col gap-3">
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
            <Button
              variant="outline"
              size="sm"
              className="w-fit shrink-0"
              onClick={() => {}}
            >
              <PencilSimple className="size-4" weight="bold" />
              Edytuj wydarzenie
            </Button>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        <div className="min-w-0 flex-1 space-y-4 overflow-auto lg:space-y-6">
          {GROUPS.map((group) => {
            const groupParticipants = participantsWithGroup.filter((p) => p.effectiveGroup === group)
            const isCollapsed = collapsedGroups.has(group)
            const toggleGroup = () => {
              setCollapsedGroups((prev) => {
                const next = new Set(prev)
                if (next.has(group)) next.delete(group)
                else next.add(group)
                return next
              })
            }
            const isListaRezerwowa = group === "listaRezerwowa"
            const maxPerGroup = isListaRezerwowa ? null : 20
            return (
              <div key={group} className="rounded-lg border border-border bg-card">
                <button
                  type="button"
                  onClick={toggleGroup}
                  className="flex w-full cursor-pointer items-center justify-between border-b border-border bg-muted/50 px-4 py-2.5 text-left transition-colors hover:bg-muted/70"
                  title={isCollapsed ? "Rozwiń tabelę" : "Zwiń tabelę"}
                >
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">{GROUP_LABELS[group] ?? `Grupa ${group}`}</h3>
                    <span className={cn(
                      "rounded-lg px-2 py-0.5 text-xs font-medium",
                      isListaRezerwowa
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                        : "bg-primary/10 text-primary"
                    )}>
                      {isListaRezerwowa
                        ? `${groupParticipants.length} oczekujących`
                        : `${groupParticipants.length} / ${maxPerGroup}`}
                    </span>
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
                    <table className="w-full min-w-[600px] table-fixed text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="w-[22%] px-4 py-3 text-left font-medium">Uczestnik</th>
                          <th className="w-[22%] px-4 py-3 text-left font-medium">Motocykl</th>
                          <th className="w-[12%] px-4 py-3 text-left font-medium">Pojemność</th>
                          <th className="w-[14%] px-4 py-3 text-left font-medium">Status</th>
                          <th className="w-[14%] px-4 py-3 text-left font-medium">Oświadczenia</th>
                          <th className="w-[16%] px-4 py-3" />
                        </tr>
                      </thead>
                      <tbody>
                        {groupParticipants.map((p) => (
                          <tr
                            key={p.id}
                            onClick={() => openDrawer(p.id)}
                            className={cn(
                              "cursor-pointer border-b border-border last:border-0 transition-colors",
                              selectedParticipantId === p.id
                                ? "bg-primary/5"
                                : "hover:bg-muted/50"
                            )}
                          >
                            <td className="px-4 py-3">
                              <span className="block truncate font-medium">
                                {p.name} {p.surname}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {p.rentsMotorcycle ? (
                                <span className="inline-flex w-fit shrink-0 rounded-lg bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                  ninja 400
                                </span>
                              ) : (
                                <span className="block truncate">{p.motorcycle}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className="block truncate text-muted-foreground">
                                {p.rentsMotorcycle ? "–" : p.capacity}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={cn(
                                  "inline-flex rounded-lg px-2 py-0.5 text-xs font-medium capitalize",
                                  getStatusStyles(p.status as ParticipantStatus)
                                )}
                              >
                                {p.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={cn(
                                  "inline-flex rounded-lg px-2 py-0.5 text-xs font-medium",
                                  (p as { oswiadczenia?: boolean }).oswiadczenia
                                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                                    : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                                )}
                              >
                                {(p as { oswiadczenia?: boolean }).oswiadczenia ? "Dodane" : "Brak"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div
                                className="flex items-center gap-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <select
                                  value={p.effectiveGroup}
                                  onChange={(e) => setParticipantGroup(p.id, e.target.value)}
                                  className={cn(
                                    "h-8 w-[6.5rem] rounded-md border border-input bg-transparent px-2 py-1 text-xs font-medium",
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
                    <div className="flex flex-col gap-2 p-2 md:hidden">
                      {groupParticipants.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => openDrawer(p.id)}
                          className={cn(
                            "flex flex-col gap-2 rounded-lg border border-border p-3 transition-colors",
                            selectedParticipantId === p.id ? "bg-primary/5" : "active:bg-muted/50"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
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
                              <span>
                                {p.motorcycle} · {p.capacity}
                              </span>
                            )}
                            <span
                              className={cn(
                                "rounded-lg px-2 py-0.5 text-xs font-medium",
                                (p as { oswiadczenia?: boolean }).oswiadczenia
                                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                                  : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                              )}
                            >
                              {(p as { oswiadczenia?: boolean }).oswiadczenia ? "Dodane" : "Brak"}
                            </span>
                          </div>
                          <div
                            className="mt-1 flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="shrink-0 text-sm text-muted-foreground">Grupa</span>
                            <select
                              value={p.effectiveGroup}
                              onChange={(e) => setParticipantGroup(p.id, e.target.value)}
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

        {selectedParticipant && (
          <>
            <div
              className="fixed inset-0 z-[55] bg-black/50 backdrop-blur-sm md:hidden"
              onClick={closeDrawer}
              aria-hidden="true"
            />
            <aside
              className={cn(
                "relative flex flex-col overflow-hidden bg-card transition-all duration-200",
                "fixed inset-0 z-[60] flex rounded-none md:static md:z-auto md:inset-auto md:h-[min(70vh,32rem)] md:w-96 md:rounded-lg md:border md:border-border md:shadow-lg md:self-start",
                isDrawerCollapsed ? "hidden md:flex md:w-14" : ""
              )}
            >
              <button
                onClick={() => setIsDrawerCollapsed((v) => !v)}
                className={cn(
                  "absolute -left-4 top-1/2 z-10 hidden h-8 w-6 -translate-y-1/2 items-center justify-center rounded-l-lg border border-r-0 border-border bg-card shadow-sm transition-colors hover:bg-primary/10 hover:border-primary/20 lg:flex",
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
                  "flex h-14 shrink-0 items-center border-b border-border",
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
                    <Button variant="ghost" size="icon-xs" onClick={closeDrawer} title="Zamknij">
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
                      <Button variant="ghost" size="icon-sm" onClick={closeDrawer} title="Zamknij">
                        <X className="size-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
              {!isDrawerCollapsed && (
                <div className="min-h-0 flex-1 space-y-6 overflow-auto p-4">
                  <section>
                    <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <IdentificationCard className="size-4" />
                      Dane osobowe
                    </h4>
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="text-muted-foreground">Imię i nazwisko</dt>
                        <dd className="font-medium">
                          {selectedParticipant.name} {selectedParticipant.surname}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Email</dt>
                        <dd>{selectedParticipant.email}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Nr tel</dt>
                        <dd>{(selectedParticipant as { phone?: string }).phone ?? "–"}</dd>
                      </div>
                    </dl>
                  </section>
                  <section>
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
                      <div>
                        <dt className="text-muted-foreground">Pojazd</dt>
                        <dd className="font-medium">{selectedParticipant.motorcycle}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Opis</dt>
                        <dd className="text-muted-foreground">
                          Yamaha R6, rok 2019, modyfikacje: exhaust, ECU tune
                        </dd>
                      </div>
                    </dl>
                  </section>
                  <section>
                    <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <FileText className="size-4" />
                      Oświadczenia
                    </h4>
                    <dl className="flex flex-col gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <dt className="text-muted-foreground">Regulamin</dt>
                        <dd>
                          <span className="inline-flex rounded-lg bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-700 dark:text-emerald-400">
                            Zaakceptowano
                          </span>
                        </dd>
                      </div>
                      <div className="flex items-center gap-2">
                        <dt className="text-muted-foreground">Zgoda na udział</dt>
                        <dd>
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
            </aside>
          </>
        )}
      </div>
    </div>
  )
}
