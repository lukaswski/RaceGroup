import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden p-6">
      {/* Tło z subtelnym gradientem w kolorach motywu */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
      <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative z-10 text-center">
        <div className="rounded-xl border border-primary/20 bg-card/80 p-8 shadow-lg backdrop-blur-sm">
          <h1 className="text-2xl font-semibold text-foreground">Race Group</h1>
          <p className="mt-1 text-muted-foreground">System rezerwacji track day&apos;ów motocyklowych</p>
          <Link href="/dashboard" className="mt-6 inline-block">
            <Button size="lg">Przejdź do dashboardu</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
