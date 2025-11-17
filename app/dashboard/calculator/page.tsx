import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server"
import { MultiCurrencyCalculator } from "@/components/multi-currency-calculator"
import Link from "next/link"
import { MobileNavBar } from "@/components/mobile-nav-bar"

export default async function CalculatorPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-black pb-20 md:pb-8">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
          >
            <span>←</span>
            <span>Voltar</span>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Calculadora Multi-Moeda</h1>
          <p className="text-gray-400">Compare múltiplas moedas simultaneamente</p>
        </div>

        <MultiCurrencyCalculator userId={user.id} />
      </div>
      <MobileNavBar />
    </div>
  )
}
