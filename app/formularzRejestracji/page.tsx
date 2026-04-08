"use client"

import { useState } from "react"
import { CalendarBlank } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import eventsData from "@/data/events.json"

const inputClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-0 focus:border-primary/50"

const selectClass =
  "h-10 w-full rounded-lg border border-input bg-background pl-3 pr-9 text-sm text-foreground outline-none transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-0 focus:border-primary/50 appearance-none bg-no-repeat bg-[length:1rem] bg-[right_0.75rem_center] [background-image:url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20fill%3D%22currentColor%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M4.22%206.22a.75.75%200%200%201%201.06%200L8%208.94l2.72-2.72a.75.75%200%201%201%201.06%201.06l-3.25%203.25a.75.75%200%200%201-1.06%200L4.22%207.28a.75.75%200%200%201%200-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')]"

const labelClass = "text-sm font-medium text-foreground"
const subtleTextClass = "text-xs text-muted-foreground"

const DAYS_CONFIG = [
  { id: 1, label: "Dzień 1", date: "12.06", price: 560 },
  { id: 2, label: "Dzień 2", date: "13.06", price: 560 },
  { id: 3, label: "Dzień 3", date: "14.06", price: 300 },
] as const
const PRICE_FROM_PER_DAY = 560
const PACKAGE_DISCOUNT = 150 // zł zniżki za wszystkie 3 dni

const EVENT_HEADER = {
  name: "Tor Poznań",
  dateRange: "12–14 czerwca 2025",
  organizer: "Race Group",
} as const

export default function FormularzRejestracjiPage() {
  const eventName = EVENT_HEADER.name

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [selectedDays, setSelectedDays] = useState<[boolean, boolean, boolean]>([false, false, false])
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [ridingGroup, setRidingGroup] = useState("A")
  const [bikeType, setBikeType] = useState<"wlasny" | "wynajem">("wlasny")
  const [notes, setNotes] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [marketingAccepted, setMarketingAccepted] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"blik" | "card" | "transfer">("blik")
  const [blikCode, setBlikCode] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvv, setCardCvv] = useState("")
  const [wantInvoice, setWantInvoice] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const basePrice = selectedDays.reduce(
    (sum, checked, i) => sum + (checked ? DAYS_CONFIG[i].price : 0),
    0
  )
  const allThreeSelected = selectedDays.every(Boolean)
  const discount = allThreeSelected ? PACKAGE_DISCOUNT : 0
  const eventPrice = Math.max(0, basePrice - discount)
  const serviceFee = Math.round(eventPrice * 0.03)
  const totalPrice = eventPrice + serviceFee

  const eventDate =
    selectedDays[0] && selectedDays[1] && selectedDays[2]
      ? "12.06–14.06"
      : DAYS_CONFIG.filter((_, i) => selectedDays[i])
          .map((d) => d.date)
          .join(", ") || "—"

  const toggleDay = (index: 0 | 1 | 2) => {
    setSelectedDays((prev) => {
      const next = [...prev] as [boolean, boolean, boolean]
      next[index] = !next[index]
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!termsAccepted) return

    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 700))
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const showForm = !isSubmitted

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          {showForm ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-0">
              {/* Nagłówek wydarzenia – na co się zapisujesz */}
              <section className="border-b border-border bg-gradient-to-b from-muted/50 to-muted/30 px-4 py-6 sm:px-6 sm:py-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary/80">
                  Rejestracja na wydarzenie
                </p>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {EVENT_HEADER.name}
                </h1>
                <p className="mt-1.5 text-sm font-medium text-muted-foreground">
                  {EVENT_HEADER.dateRange}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Organizator: <span className="font-medium text-foreground">{EVENT_HEADER.organizer}</span>
                </p>
              </section>

              <section className="border-b border-border bg-background px-4 py-5 sm:px-6 sm:py-6">
                <div className="flex items-end justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Wydarzenia organizatora
                    </p>
                    <h2 className="text-sm font-semibold text-foreground">{EVENT_HEADER.organizer}</h2>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {(eventsData as Array<{
                    id: string
                    name: string
                    date: string
                    participants?: number
                    maxCapacity?: number
                    listaRezerwowa?: number
                  }>).map((ev) => (
                    <button
                      key={ev.id}
                      type="button"
                      aria-pressed={selectedEventId === ev.id}
                      onClick={() => setSelectedEventId(ev.id)}
                      className={cn(
                        "w-full text-left rounded-xl border p-3 shadow-sm",
                        "transition-colors",
                        selectedEventId === ev.id
                          ? "border-primary/60 bg-primary/10 ring-2 ring-primary/25"
                          : "border-border bg-card/60 hover:bg-card"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{ev.name}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <CalendarBlank className="size-4" weight="bold" />
                              {ev.date}
                            </span>
                            <span className="text-muted-foreground/50">•</span>
                            <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                              od {PRICE_FROM_PER_DAY}/dzień
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section className="grid gap-4 bg-muted/20 p-4 sm:p-6 sm:gap-5">
                <div className="grid gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Wybierz dni
                  </span>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {DAYS_CONFIG.map((day, i) => (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => toggleDay(i as 0 | 1 | 2)}
                        className={cn(
                          "flex min-h-10 items-center justify-between rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors",
                          selectedDays[i]
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        )}
                      >
                        <div>
                          <span className="block">{day.label}</span>
                          <span className="block text-xs font-normal opacity-80">{day.date}</span>
                        </div>
                        <span className="text-xs shrink-0">{day.price} zł</span>
                      </button>
                    ))}
                  </div>
                  <p className={subtleTextClass}>
                    Pakiet 3 dni: rabat {PACKAGE_DISCOUNT} zł. Wybierz wszystkie dni, aby skorzystać.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  <div className="grid gap-1.5">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Termin
                    </span>
                    <p className="text-sm font-medium text-foreground">
                      {eventDate}
                    </p>
                    <p className={subtleTextClass}>
                      {selectedDays.some(Boolean)
                        ? "Wybrane dni – podział na grupy według poziomu."
                        : "Wybierz co najmniej jeden dzień."}
                    </p>
                  </div>
                  <div className="grid gap-1.5">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Cena pakietu
                    </span>
                    <p className="text-lg font-semibold text-primary">
                      {eventPrice} zł{" "}
                      <span className="align-middle text-xs font-normal text-muted-foreground">
                        brutto
                      </span>
                    </p>
                    {discount > 0 && (
                      <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        Rabat {discount} zł za pakiet 3 dni
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section className="grid gap-4 rounded-lg bg-muted/20 p-4 sm:p-5">
                <h2 className="text-sm font-semibold text-foreground">Dane uczestnika</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <label htmlFor="firstName" className={labelClass}>
                      Imię
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="np. Jan"
                      className={inputClass}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="lastName" className={labelClass}>
                      Nazwisko
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="np. Kowalski"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <label htmlFor="email" className={labelClass}>
                      E-mail
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="np. jan.kowalski@example.com"
                      className={inputClass}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="phone" className={labelClass}>
                      Telefon
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="np. 600 000 000"
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              <section className="grid gap-4 rounded-lg bg-muted/20 p-4 sm:p-5">
                <h2 className="text-sm font-semibold text-foreground">Ustawienia jazdy</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-start">
                  <div className="grid gap-2">
                    <label htmlFor="ridingGroup" className={labelClass}>
                      Grupa jazdy
                    </label>
                    <select
                      id="ridingGroup"
                      value={ridingGroup}
                      onChange={(e) => setRidingGroup(e.target.value)}
                      className={selectClass}
                    >
                      <option value="A">Grupa A – zaawansowana</option>
                      <option value="B">Grupa B – średnio zaawansowana</option>
                      <option value="C">Grupa C – początkująca</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <span className={labelClass}>Motocykl</span>
                    <div className="grid h-10 grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setBikeType("wlasny")}
                        className={cn(
                          "h-full rounded-lg border px-3 text-sm font-medium transition-colors",
                          bikeType === "wlasny"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        )}
                      >
                        Własny motocykl
                      </button>
                      <button
                        type="button"
                        onClick={() => setBikeType("wynajem")}
                        className={cn(
                          "h-full rounded-lg border px-3 text-sm font-medium transition-colors",
                          bikeType === "wynajem"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        )}
                      >
                        Wynajem motocykla
                      </button>
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="notes" className={labelClass}>
                    Uwagi (opcjonalne)
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Np. doświadczenie, specjalne potrzeby, dodatkowe informacje…"
                    rows={3}
                    className={cn(inputClass, "resize-none")}
                  />
                  <p className={subtleTextClass}>
                    Te pola pomagają organizatorowi dopasować grupę oraz przekazać ważne informacje
                    do obsługi toru.
                  </p>
                </div>
              </section>

              <section className="grid gap-4 rounded-lg bg-muted/20 p-4 sm:p-5">
                <h2 className="text-sm font-semibold text-foreground">Płatność</h2>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                  <div className="grid gap-3">
                    <div className="grid gap-2">
                      <span className={labelClass}>Metoda płatności</span>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("blik")}
                          className={cn(
                            "h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
                            paymentMethod === "blik"
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                          )}
                        >
                          BLIK
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("card")}
                          className={cn(
                            "h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
                            paymentMethod === "card"
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                          )}
                        >
                          Karta
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("transfer")}
                          className={cn(
                            "h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
                            paymentMethod === "transfer"
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                          )}
                        >
                          Przelew on-line
                        </button>
                      </div>
                    </div>

                    {paymentMethod === "blik" && (
                      <div className="grid gap-2 rounded-lg border border-dashed border-primary/40 bg-primary/5 p-3">
                        <label htmlFor="blik" className={labelClass}>
                          Kod BLIK
                        </label>
                        <input
                          id="blik"
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={blikCode}
                          onChange={(e) => setBlikCode(e.target.value)}
                          placeholder="Wpisz 6‑cyfrowy kod BLIK"
                          className={inputClass}
                        />
                      </div>
                    )}

                    {paymentMethod === "card" && (
                      <div className="grid gap-3 rounded-lg border border-dashed border-primary/40 bg-primary/5 p-3">
                        <div className="grid gap-2">
                          <label htmlFor="cardNumber" className={labelClass}>
                            Numer karty
                          </label>
                          <input
                            id="cardNumber"
                            type="text"
                            inputMode="numeric"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="0000 0000 0000 0000"
                            className={inputClass}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="grid gap-2">
                            <label htmlFor="cardExpiry" className={labelClass}>
                              Data ważności
                            </label>
                            <input
                              id="cardExpiry"
                              type="text"
                              placeholder="MM/RR"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              className={inputClass}
                            />
                          </div>
                          <div className="grid gap-2">
                            <label htmlFor="cardCvv" className={labelClass}>
                              CVV
                            </label>
                            <input
                              id="cardCvv"
                              type="password"
                              maxLength={3}
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              className={inputClass}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "transfer" && (
                      <div className="grid gap-2 rounded-lg border border-dashed border-primary/40 bg-primary/5 p-3">
                        <p className={subtleTextClass}>
                          Po kliknięciu „Opłać” zostaniesz przekierowany do wyboru banku i
                          potwierdzenia płatności.
                        </p>
                      </div>
                    )}
                  </div>

                  <aside className="grid gap-3 rounded-lg border border-border bg-background p-3 sm:p-4">
                    <h3 className="text-sm font-semibold text-foreground">Podsumowanie płatności</h3>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Wydarzenie</span>
                        <span className="font-medium text-foreground">{eventName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Termin</span>
                        <span className="font-medium text-foreground">{eventDate}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Pakiet jazdy</span>
                        <span className="font-medium text-foreground">
                          {bikeType === "wynajem"
                            ? "Udział + wynajem motocykla"
                            : "Udział – własny motocykl"}
                        </span>
                      </div>
                    </div>
                    <div className="border-t border-dashed border-border/80 pt-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Kwota podstawowa</span>
                        <span className="font-medium text-foreground">{basePrice} zł</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Rabat (pakiet 3 dni)</span>
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            −{discount} zł
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Opłata serwisowa (3%)</span>
                        <span className="font-medium text-foreground">{serviceFee} zł</span>
                      </div>
                    </div>
                    <div className="border-t border-border pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground">
                          Do zapłaty
                        </span>
                        <span className="text-base font-semibold text-primary">
                          {totalPrice} zł
                        </span>
                      </div>
                    </div>
                    <label className="mt-1.5 flex items-start gap-2 text-[11px] text-muted-foreground">
                      <input
                        type="checkbox"
                        className="mt-0.5 size-4 shrink-0 rounded border border-input text-primary"
                        checked={wantInvoice}
                        onChange={(e) => setWantInvoice(e.target.checked)}
                      />
                      <span>Chcę otrzymać fakturę</span>
                    </label>
                  </aside>
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting || !termsAccepted || eventPrice === 0}
                  className="mt-4 w-full"
                >
                  {isSubmitting ? "Przetwarzanie płatności…" : "Opłać i zarejestruj"}
                </Button>
              </section>

              <section className="grid gap-3 rounded-lg bg-muted/10 p-4 sm:p-5">
                <h2 className="text-sm font-semibold text-foreground">Zgody</h2>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      className="mt-0.5 size-4 shrink-0 rounded border border-input text-primary"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                    />
                    <span>
                      Oświadczam, że zapoznałem(-am) się z regulaminem wydarzenia oraz akceptuję
                      jego postanowienia. Potwierdzam, że moje dane mogą być przetwarzane w celu
                      obsługi zgłoszenia na wydarzenie.
                    </span>
                  </label>
                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      className="mt-0.5 size-4 shrink-0 rounded border border-input text-primary"
                      checked={marketingAccepted}
                      onChange={(e) => setMarketingAccepted(e.target.checked)}
                    />
                    <span>
                      Wyrażam zgodę na kontakt mailowy/SMS w sprawie informacji o kolejnych
                      wydarzeniach (opcjonalnie).
                    </span>
                  </label>
                </div>
              </section>
            </form>
          ) : (
            <div className="flex flex-col gap-4 p-6 sm:p-8">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">
                  Płatność przyjęta
                </h2>
                <p className="text-sm text-muted-foreground">
                  Dziękujemy za rejestrację. Na podany adres e-mail wysłaliśmy potwierdzenie oraz
                  dalsze instrukcje dotyczące wydarzenia.
                </p>
              </div>
              <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4 text-xs text-muted-foreground">
                <p className="mb-2 font-medium text-foreground">Dane zgłoszenia:</p>
                <ul className="space-y-1">
                  <li>
                    <span className="font-medium text-foreground">Wydarzenie:</span>{" "}
                    {eventName}
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Uczestnik:</span>{" "}
                    {firstName || lastName ? `${firstName} ${lastName}`.trim() : "—"}
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Kontakt:</span>{" "}
                    {email || phone ? [email, phone].filter(Boolean).join(" / ") : "—"}
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Grupa jazdy:</span>{" "}
                    {ridingGroup ? `Grupa ${ridingGroup}` : "—"}
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Motocykl:</span>{" "}
                    {bikeType === "wynajem" ? "Wynajem motocykla" : "Własny motocykl"}
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Metoda płatności:</span>{" "}
                    {paymentMethod === "blik"
                      ? "BLIK"
                      : paymentMethod === "card"
                      ? "Karta płatnicza"
                      : "Przelew on-line"}
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Kwota:</span> {totalPrice} zł
                  </li>
                </ul>
              </div>
              <Button
                variant="outline"
                className="self-start"
                onClick={() => {
                  setIsSubmitted(false)
                }}
              >
                Wróć do formularza
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

