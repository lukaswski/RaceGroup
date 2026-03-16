"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import { ArrowLeft, CalendarBlank } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

const LOKALIZACJE = [
  { id: "kisielin", label: "Kisielin" },
  { id: "bydgoszcz", label: "Bydgoszcz" },
  { id: "poznan", label: "Poznań" },
  { id: "tryniec", label: "Trzyniec" },
  { id: "slomczyn", label: "Słomczyn" },
]

const MOTOCYKLE_DO_WYNAJECIA = [
  { id: "r1", name: "Kawasaki Ninja 250" },
  { id: "r2", name: "Kawasaki Ninja 250" },
  { id: "r3", name: "Kawasaki Ninja 300" },
  { id: "r4", name: "Kawasaki Ninja 300" },
  { id: "r5", name: "Kawasaki Ninja 400" },
]

const inputClass =
  "w-full max-w-md rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-0 focus:border-primary/50"
const selectClass =
  inputClass +
  " appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10 [background-image:url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20fill%3D%22currentColor%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M4.22%206.22a.75.75%200%200%201%201.06%200L8%208.94l2.72-2.72a.75.75%200%201%201%201.06%201.06l-3.25%203.25a.75.75%200%200%201-1.06%200L4.22%207.28a.75.75%200%200%201%200-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')]"
const labelClass = "text-sm font-medium text-foreground"

export default function NoweWydarzeniePage() {
  const router = useRouter()
  const [nazwa, setNazwa] = useState("")
  const [lokalizacja, setLokalizacja] = useState("")
  const [wydarzenieKilkuDnioweChecked, setWydarzenieKilkuDnioweChecked] =
    useState(false)
  const [dataDate, setDataDate] = useState<Date | undefined>(undefined)
  const [daty, setDaty] = useState<Date[]>([])
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [cena, setCena] = useState("")
  const [cenaZaWszystkieDni, setCenaZaWszystkieDni] = useState("")
  const [maxUczestnicy, setMaxUczestnicy] = useState("80")
  const [maxWynajmuje, setMaxWynajmuje] = useState("10")
  const [podzialNaGrupyChecked, setPodzialNaGrupyChecked] = useState(false)
  const [grupy, setGrupy] = useState<Array<{ nazwa: string; maxUczestnicy: string }>>([])
  const [wynajemMotocykliChecked, setWynajemMotocykliChecked] = useState(false)
  const [motocykle, setMotocykle] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Mock POST – symulacja wysłania
    await new Promise((r) => setTimeout(r, 600))
    setIsSubmitting(false)
    router.push("/dashboard")
  }

  const dodajDate = (date: Date | undefined) => {
    if (!date) return
    setDaty((prev) => [...prev, date])
  }

  const usunDate = (index: number) => {
    setDaty((prev) => prev.filter((_, i) => i !== index))
  }

  const dodajGrupe = () => {
    setGrupy((prev) => [...prev, { nazwa: "", maxUczestnicy: "" }])
  }

  const usunGrupe = (index: number) => {
    setGrupy((prev) => prev.filter((_, i) => i !== index))
  }

  const updateGrupa = (
    index: number,
    field: "nazwa" | "maxUczestnicy",
    value: string
  ) => {
    setGrupy((prev) =>
      prev.map((g, i) => (i === index ? { ...g, [field]: value } : g))
    )
  }

  const toggleMotocykl = (id: string) => {
    setMotocykle((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden p-4 sm:p-6">
      <div className="mb-4 flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <h1 className="text-lg font-semibold sm:text-xl">Nowe wydarzenie</h1>
        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="size-4" weight="bold" />
          Powrót do listy
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl rounded-lg border border-border bg-card">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4 sm:p-6">
            <section className="grid gap-4 rounded-lg bg-muted/30 p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-foreground">Podstawowe informacje</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label htmlFor="nazwa" className={labelClass}>
                    Nazwa wydarzenia
                  </label>
                  <input
                    id="nazwa"
                    type="text"
                    value={nazwa}
                    onChange={(e) => setNazwa(e.target.value)}
                    placeholder="np. Track Day Stary Kisielin"
                    className={inputClass}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="lokalizacja" className={labelClass}>
                    Lokalizacja
                  </label>
                  <select
                    id="lokalizacja"
                    value={lokalizacja}
                    onChange={(e) => setLokalizacja(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Wybierz lokalizację</option>
                    {LOKALIZACJE.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section className="grid gap-3 rounded-lg bg-muted/20 p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-foreground">Terminy i cena</h2>
              <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <Switch
                  checked={wydarzenieKilkuDnioweChecked}
                  onCheckedChange={(checked) => {
                    setWydarzenieKilkuDnioweChecked(checked)
                    if (!checked) setDaty([])
                  }}
                />
                <span className={labelClass}>Wydarzenie kilku dniowe</span>
              </div>
              {!wydarzenieKilkuDnioweChecked ? (
                <div className="grid gap-2">
                  <label className={labelClass}>Data</label>
                  <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          inputClass,
                          "flex items-center gap-2 text-left",
                          !dataDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarBlank
                          className="size-4 shrink-0"
                          weight="regular"
                        />
                        {dataDate
                          ? format(dataDate, "d MMMM yyyy", { locale: pl })
                          : "Wybierz datę"}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dataDate}
                        onSelect={(date) => {
                          setDataDate(date)
                          setDatePickerOpen(false)
                        }}
                        defaultMonth={dataDate ?? new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              ) : (
                <>
                  <div className="flex max-w-md gap-2">
                    <Popover
                      open={datePickerOpen}
                      onOpenChange={setDatePickerOpen}
                    >
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            inputClass,
                            "flex items-center gap-2 text-left",
                            "text-muted-foreground"
                          )}
                        >
                          <CalendarBlank
                            className="size-4 shrink-0"
                            weight="regular"
                          />
                          Wybierz datę do dodania
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={undefined}
                          onSelect={(date) => {
                            dodajDate(date)
                            setDatePickerOpen(false)
                          }}
                          defaultMonth={daty[daty.length - 1] ?? new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  {daty.length > 0 && (
                    <div className="max-w-md rounded-lg border border-input bg-muted/20 p-3">
                      <div className="flex flex-wrap gap-2">
                        {daty.map((d, i) => (
                          <button
                            key={`${d.toISOString()}-${i}`}
                            type="button"
                            onClick={() => usunDate(i)}
                            className="rounded-lg border border-primary bg-primary/12 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                          >
                            {format(d, "d MMM yyyy", { locale: pl })}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {!wydarzenieKilkuDnioweChecked ? (
              <div className="grid gap-2">
                <label htmlFor="cena" className={labelClass}>
                  Cena (zł)
                </label>
                <input
                  id="cena"
                  type="number"
                  min={0}
                  step={1}
                  value={cena}
                  onChange={(e) => setCena(e.target.value)}
                  placeholder="np. 299"
                  className={inputClass}
                />
              </div>
            ) : (
              <div className="grid gap-2">
                <label htmlFor="cena-wszystkie-dni" className={labelClass}>
                  Cena za wszystkie dni (zł)
                </label>
                <input
                  id="cena-wszystkie-dni"
                  type="number"
                  min={0}
                  step={1}
                  value={cenaZaWszystkieDni}
                  onChange={(e) => setCenaZaWszystkieDni(e.target.value)}
                  placeholder="np. 799"
                  className={inputClass}
                />
              </div>
            )}
            </section>

            <section className="grid gap-3 rounded-lg bg-muted/20 p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-foreground">Uczestnicy</h2>
              <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <Switch
                  checked={podzialNaGrupyChecked}
                  onCheckedChange={(checked) => {
                    setPodzialNaGrupyChecked(checked)
                    if (checked && grupy.length === 0) dodajGrupe()
                    if (!checked) setGrupy([])
                  }}
                />
                <span className={labelClass}>Podział na grupy</span>
              </div>
              {podzialNaGrupyChecked && (
                <div className="grid gap-3">
                  <div className="rounded-lg border border-input bg-muted/20 p-4 space-y-4">
                    {grupy.map((g, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-border bg-background p-3 space-y-3"
                      >
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3">
                          <div className="grid gap-1.5">
                            <label
                              htmlFor={`nazwa-grupy-${i}`}
                              className="text-xs font-medium text-muted-foreground"
                            >
                              Nazwa {i + 1}. grupy
                            </label>
                            <input
                              id={`nazwa-grupy-${i}`}
                              type="text"
                              value={g.nazwa}
                              onChange={(e) =>
                                updateGrupa(i, "nazwa", e.target.value)
                              }
                              placeholder="np. Grupa A"
                              className={inputClass}
                            />
                          </div>
                          <div className="grid gap-1.5">
                            <label
                              htmlFor={`max-uczestnicy-grupy-${i}`}
                              className="text-xs font-medium text-muted-foreground"
                            >
                              Maks. uczestnicy dla grupy
                            </label>
                            <input
                              id={`max-uczestnicy-grupy-${i}`}
                              type="number"
                              min={1}
                              value={g.maxUczestnicy}
                              onChange={(e) =>
                                updateGrupa(i, "maxUczestnicy", e.target.value)
                              }
                              placeholder="np. 20"
                              className={inputClass}
                            />
                          </div>
                        </div>
                        {grupy.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 text-muted-foreground hover:text-foreground"
                            onClick={() => usunGrupe(i)}
                          >
                            Usuń grupę
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full border-dashed"
                      onClick={dodajGrupe}
                    >
                      Dodaj kolejną grupę
                    </Button>
                  </div>
                </div>
              )}
              {!podzialNaGrupyChecked && (
                <div className="grid gap-2 max-w-md">
                  <label htmlFor="max-uczestnicy" className={labelClass}>
                    Maks. uczestnicy
                  </label>
                  <input
                    id="max-uczestnicy"
                    type="number"
                    min={1}
                    value={maxUczestnicy}
                    onChange={(e) => setMaxUczestnicy(e.target.value)}
                    className={inputClass}
                  />
                </div>
              )}
            </div>
            </section>

            <section className="grid gap-3 rounded-lg bg-muted/20 p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-foreground">Wynajmy</h2>
              <div className="grid gap-2 max-w-md">
              <label htmlFor="max-wynajmuje" className={labelClass}>
                Maks. wynajmuje
              </label>
              <input
                id="max-wynajmuje"
                type="number"
                min={0}
                value={maxWynajmuje}
                onChange={(e) => setMaxWynajmuje(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <Switch
                  checked={wynajemMotocykliChecked}
                  onCheckedChange={setWynajemMotocykliChecked}
                />
                <span className={labelClass}>Wynajem motocykli</span>
              </div>
              {wynajemMotocykliChecked && (
                <div className="grid gap-2">
                  <div className="rounded-lg border border-input bg-muted/20 p-3">
                    <div className="flex flex-wrap gap-2">
                      {MOTOCYKLE_DO_WYNAJECIA.map((m) => {
                        const checked = motocykle.includes(m.id)
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => toggleMotocykl(m.id)}
                            className={cn(
                              "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                              checked
                                ? "border-primary bg-primary/12 text-primary"
                                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                            )}
                          >
                            {m.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Wybierz motocykle dostępne do wynajęcia podczas wydarzenia
                  </p>
                </div>
              )}
            </div>
            </section>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="w-full sm:w-auto"
              >
                Anuluj
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? "Zapisywanie…" : "Dodaj wydarzenie"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
