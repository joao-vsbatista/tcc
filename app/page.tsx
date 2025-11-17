import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server"
import { CurrencyConverter } from "@/components/currency-converter"
import { UserNav } from "@/components/user-nav"
import { WatchlistWidget } from "@/components/watchlist-widget"
import { QuickActions } from "@/components/quick-actions"
import { KeyboardShortcutsHelp } from "@/components/keyboard-shortcuts-help"
import { WalletBalanceWidget } from "@/components/wallet-balance-widget"
import { MobileNavBar } from "@/components/mobile-nav-bar"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-black pb-20 md:pb-8">
      <UserNav user={user} profile={profile} />
      <CurrencyConverter user={user} profile={profile} />
      <div className="container max-w-md mx-auto px-4 pb-8 space-y-6">
        <WalletBalanceWidget userId={user.id} />
        <div className="hidden md:block">
          <QuickActions />
        </div>
        <WatchlistWidget userId={user.id} />
      </div>
      <KeyboardShortcutsHelp />
      <MobileNavBar />
    </div>
  )
}
