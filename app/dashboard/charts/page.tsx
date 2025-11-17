"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { CurrencyChart } from "@/components/currency-chart"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { MobileNavBar } from "@/components/mobile-nav-bar"

export default function ChartsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
      } else {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    )
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
          <h1 className="text-3xl font-bold text-white mb-2">Análise de Tendências</h1>
          <p className="text-gray-400">Visualize a variação das taxas de câmbio</p>
        </div>

        <CurrencyChart />
      </div>
      <MobileNavBar />
    </div>
  )
}
