"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      router.push("/dashboard")
    } else {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-6">
            <Image src="/logo.jpg" alt="Conversor de Moedas Logo" width={120} height={120} className="rounded-3xl" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Conversor de Moedas
          </h1>
          <p className="text-xl text-gray-400 mb-8">Sistema completo de conversão com análise e histórico</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Gráficos e Análise</h3>
            <p className="text-gray-400">Visualize tendências de moedas com gráficos interativos</p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-bold mb-2">Histórico Completo</h3>
            <p className="text-gray-400">Todas suas conversões salvas e exportáveis</p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-xl font-bold mb-2">Watchlist</h3>
            <p className="text-gray-400">Acompanhe seus pares de moedas favoritos</p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
            <div className="text-4xl mb-4">🔔</div>
            <h3 className="text-xl font-bold mb-2">Alertas de Preço</h3>
            <p className="text-gray-400">Receba notificações quando atingir sua meta</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push("/auth/sign-up")}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            Criar Conta Grátis
          </button>
          <button
            onClick={() => router.push("/auth/login")}
            className="px-8 py-4 bg-gray-800 text-white font-semibold rounded-xl border border-gray-700 hover:bg-gray-700 transition-colors"
          >
            Já tenho conta
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-8">Projeto de TCC</p>
      </div>
    </div>
  )
}
