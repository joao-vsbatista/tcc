"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface WalletBalanceWidgetProps {
  userId: string
}

export function WalletBalanceWidget({ userId }: WalletBalanceWidgetProps) {
  const [brlBalance, setBrlBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadBalance()
  }, [userId])

  const loadBalance = async () => {
    try {
      const { data: brlWallet } = await supabase
        .from("wallet")
        .select("balance")
        .eq("user_id", userId)
        .eq("currency", "BRL")
        .single()

      setBrlBalance(brlWallet?.balance || 0)
    } catch (error) {
      console.error("Error loading balance:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="text-center py-8">
      <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Saldo Disponível</p>

      {loading ? (
        <div className="animate-pulse">
          <div className="h-12 bg-gray-800 rounded w-48 mx-auto mb-2"></div>
        </div>
      ) : (
        <>
          <h1 className="text-5xl font-bold text-white mb-2">
            {brlBalance.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </h1>
          <p className="text-xl text-gray-400 font-medium">BRL</p>
        </>
      )}
    </div>
  )
}
