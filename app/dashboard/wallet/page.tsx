import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server"
import { WalletManager } from "@/components/wallet-manager"
import { MobileNavBar } from "@/components/mobile-nav-bar"

export default async function WalletPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: walletData } = await supabase
    .from("wallet")
    .select("*")
    .eq("user_id", user.id)
    .order("balance", { ascending: false })

  return (
    <div className="min-h-screen bg-black pb-20 md:pb-8">
      <div className="container max-w-md mx-auto px-4 py-6">
        <div className="mb-6">
          <a
            href="/dashboard"
            className="inline-flex items-center text-gray-400 hover:text-white mb-4"
          >
            ← Voltar
          </a>
          <h1 className="text-3xl font-bold text-white mb-2">Carteira</h1>
          <p className="text-gray-400">Gerencie seus saldos em diferentes moedas</p>
        </div>

        <WalletManager userId={user.id} initialWalletData={walletData || []} />
      </div>
      <MobileNavBar />
    </div>
  )
}
