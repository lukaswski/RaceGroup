"use client"

import { useState } from "react"
import { PencilSimple, Pause, Check, Plus } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type RentalStatus = "gotowy" | "zawieszony"

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "nd"
  const [y, m, d] = dateStr.split("-")
  return d && m && y ? `${d}.${m}.${y}` : dateStr
}

const RENTAL_MOTORCYCLES = [
  { id: "r1", name: "Kawasaki Ninja 250", rented: 11, max: 20, price: 300, status: "gotowy" as RentalStatus, przeglad: "2025-03-20", ubezpieczenie: "2025-12-31" },
  { id: "r2", name: "Kawasaki Ninja 250", rented: 8, max: 20, price: 300, status: "gotowy" as RentalStatus, przeglad: "2025-06-15", ubezpieczenie: "2025-04-01" },
  { id: "r3", name: "Kawasaki Ninja 300", rented: 15, max: 20, price: 300, status: "gotowy" as RentalStatus, przeglad: "2025-07-10", ubezpieczenie: "2025-11-20" },
  { id: "r4", name: "Kawasaki Ninja 300", rented: 12, max: 20, price: 300, status: "zawieszony" as RentalStatus, przeglad: null, ubezpieczenie: null },
  { id: "r5", name: "Kawasaki Ninja 400", rented: 18, max: 20, price: 300, status: "gotowy" as RentalStatus, przeglad: "2025-09-01", ubezpieczenie: "2026-01-15" },
]

export default function WynajmyPage() {
  const [rentals, setRentals] = useState(RENTAL_MOTORCYCLES)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingPrice, setEditingPrice] = useState("")

  const startEditing = (id: string, price: number) => {
    setEditingId(id)
    setEditingPrice(String(price))
  }

  const confirmEdit = () => {
    if (!editingId) return
    const price = parseInt(editingPrice, 10)
    if (!isNaN(price) && price >= 0) {
      setRentals((prev) =>
        prev.map((r) => (r.id === editingId ? { ...r, price } : r))
      )
    }
    setEditingId(null)
    setEditingPrice("")
  }

  const toggleRentalStatus = (id: string) => {
    setRentals((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: r.status === "gotowy" ? "zawieszony" : "gotowy" } : r
      )
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-4 sm:p-6">
      <div className="mb-4 flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <h1 className="text-lg font-semibold sm:text-xl">Wynajmy</h1>
        <Button variant="outline" size="sm" onClick={() => {}}>
          <Plus className="size-4" weight="bold" />
          Dodaj motocykl
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
        <div className="min-w-[720px] rounded-lg border border-border bg-card">
          <table className="w-full table-fixed text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="w-[20%] px-3 py-2 text-left font-medium">Motocykl</th>
                  <th className="w-[10%] px-3 py-2 text-left font-medium">Statystyki</th>
                  <th className="w-[14%] px-3 py-2 text-left font-medium">Przegląd</th>
                  <th className="w-[14%] px-3 py-2 text-left font-medium">Ubezpieczenie</th>
                  <th className="w-[12%] px-3 py-2 text-left font-medium">Status</th>
                  <th className="w-[14%] px-3 py-2 text-right font-medium">Cena</th>
                  <th className="w-[16%] px-3 py-2 text-right" />
                </tr>
              </thead>
              <tbody>
                {rentals.map((m) => (
                  <tr key={m.id} className="border-b border-border last:border-0 transition-colors even:bg-muted/40 hover:bg-muted/30">
                    <td className="px-3 py-2">
                      <span className="block truncate font-medium">{m.name}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-muted-foreground">
                        {m.rented}/{m.max}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={cn(
                        "rounded-lg px-2 py-0.5 text-xs font-medium",
                        m.przeglad ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" : "bg-muted text-muted-foreground"
                      )}>
                        {formatDate(m.przeglad ?? null)}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={cn(
                        "rounded-lg px-2 py-0.5 text-xs font-medium",
                        m.ubezpieczenie ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" : "bg-muted text-muted-foreground"
                      )}>
                        {formatDate(m.ubezpieczenie ?? null)}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={cn(
                          "inline-flex rounded-lg px-2 py-0.5 text-xs font-medium",
                          m.status === "gotowy"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {m.status === "gotowy" ? "Gotowy" : "Zawieszony"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className="inline-flex w-28 items-center justify-end gap-1.5">
                        {editingId === m.id ? (
                          <>
                            <input
                              type="number"
                              min={0}
                              value={editingPrice}
                              onChange={(e) => setEditingPrice(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && confirmEdit()}
                              className="h-7 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                              autoFocus
                            />
                            <span className="shrink-0 text-muted-foreground text-sm">zł</span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">{m.price} zł</span>
                        )}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {editingId === m.id ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-[5.5rem] shrink-0"
                            onClick={confirmEdit}
                          >
                            <Check className="size-3.5 shrink-0" weight="bold" />
                            Potwierdź
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-[5.5rem] shrink-0"
                            onClick={() => startEditing(m.id, m.price)}
                          >
                            <PencilSimple className="size-3.5 shrink-0" weight="bold" />
                            Edytuj
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-[5.25rem] shrink-0"
                          onClick={() => toggleRentalStatus(m.id)}
                          title={m.status === "gotowy" ? "Zawieś wynajem" : "Przywróć wynajem"}
                        >
                          {m.status === "gotowy" ? (
                            <>
                              <Pause className="size-3.5" weight="bold" />
                              Zawieś
                            </>
                          ) : (
                            <>
                              <Check className="size-3.5" weight="bold" />
                              Gotowy
                            </>
                          )}
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
