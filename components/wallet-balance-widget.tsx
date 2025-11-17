"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { CurrencyIcon } from "@/components/icons"
import Link from "next/link"

interface WalletBalanceWidgetProps {
  userId: string
}

export function WalletBalanceWidget({ userId }: WalletBalanceWidgetProps) {
  const [brlBalance, setBrlBalance] = useState<number>(0)
  const [totalInBrl, setTotalInBrl] = useState<number>(0)
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

      const { data: allWallets } = await supabase
        .from("wallet")
        .select("*")
        .eq("user_id", userId)

      setBrlBalance(brlWallet?.balance || 0)

      if (allWallets && allWallets.length > 0) {
        let total = 0
        for (const wallet of allWallets) {
          if (wallet.currency === "BRL") {
            total += wallet.balance
          } else {
            const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${wallet.currency}`)
            const data = await response.json()
            const rate = data.rates.BRL
            total += wallet.balance * rate
          }
        }
        setTotalInBrl(total)
      }
    } catch (error) {
      console.error("Error loading balance:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-lg border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-sm">
      <CardContent className="pt-6">
        <Link href="/dashboard/wallet" className="block hover:opacity-80 transition-opacity">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <CurrencyIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Saldo Total</p>
                <p className="text-sm text-gray-500">Ver carteira →</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-700 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-24"></div>
            </div>
          ) : (
            <div>
              <p className="text-3xl font-bold text-white mb-1">
                R$ {totalInBrl.toFixed(2)}
              </p>
              <p className="text-sm text-gray-400">
                BRL: R$ {brlBalance.toFixed(2)}
              </p>
            </div>
          )}
        </Link>
      </CardContent>
    </Card>
  )
}
