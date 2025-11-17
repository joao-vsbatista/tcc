"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CurrencySelect } from "@/components/currency-select"
import { RecentConversionsDB } from "@/components/recent-conversions-db"
import { createClient } from "@/lib/supabase/client"
import { TrendingUpIcon } from "@/components/icons"

interface CurrencyConverterProps {
  user: {
    id: string
  }
  profile: {
    default_from_currency?: string
    default_to_currency?: string
  } | null
}

export function CurrencyConverter({ user, profile }: CurrencyConverterProps) {
  const [amount, setAmount] = useState("100")
  const [fromCurrency, setFromCurrency] = useState(profile?.default_from_currency || "USD")
  const [toCurrency, setToCurrency] = useState(profile?.default_to_currency || "BRL")
  const [result, setResult] = useState<number | null>(null)
  const [rate, setRate] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const supabase = createClient()

  // Agora a conversão só acontece quando o usuário clica no botão

  useEffect(() => {
    calculatePreview()
  }, [fromCurrency, toCurrency, amount])

  const calculatePreview = async () => {
    if (!amount || isNaN(Number(amount))) {
      setResult(null)
      return
    }

    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`)
      const data = await response.json()
      const exchangeRate = data.rates[toCurrency]
      const convertedAmount = Number(amount) * exchangeRate

      setRate(exchangeRate)
      setResult(convertedAmount)
    } catch (error) {
      console.error("Error calculating preview:", error)
    }
  }

  const convertAndSave = async () => {
    if (!amount || isNaN(Number(amount))) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`)
      const data = await response.json()
      const exchangeRate = data.rates[toCurrency]
      const convertedAmount = Number(amount) * exchangeRate

      setRate(exchangeRate)
      setResult(convertedAmount)
      setLastUpdate(new Date())

      // Salva no histórico apenas quando o botão é clicado
      await saveConversion(fromCurrency, toCurrency, Number(amount), convertedAmount, exchangeRate)
    } catch (error) {
      console.error("Error converting currency:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveConversion = async (from: string, to: string, amt: number, res: number, r: number) => {
    try {
      await supabase.from("conversion_history").insert({
        user_id: user.id,
        from_currency: from,
        to_currency: to,
        amount: amt,
        result: res,
        rate: r,
      })
      setRefreshKey((prev) => prev + 1)
    } catch (error) {
      console.error("Error saving conversion:", error)
    }
  }

  const swapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  return (
    <div className="container max-w-md mx-auto px-4 pb-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
          <TrendingUpIcon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Conversor de Moedas</h1>
        <p className="text-gray-400">Taxas de câmbio em tempo real</p>
      </div>

      {/* Main Converter Card */}
      <Card className="p-6 mb-6 shadow-lg border border-gray-800 bg-gray-900">
        <div className="space-y-6">
          {/* From Currency */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">De</label>
            <div className="flex gap-3">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-2xl font-semibold h-14 bg-gray-800 border-gray-700 text-white"
                placeholder="0.00"
              />
              <CurrencySelect value={fromCurrency} onChange={setFromCurrency} />
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={swapCurrencies}
              className="rounded-full w-12 h-12 border-2 border-gray-700 hover:bg-gray-800 hover:border-gray-600 transition-all bg-gray-900 text-white"
            >
              <span className="text-xl">⇅</span>
            </Button>
          </div>

          {/* To Currency */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Para</label>
            <div className="flex gap-3">
              <div className="flex-1 h-14 rounded-lg border border-gray-700 bg-gray-800 px-4 flex items-center">
                <span className="text-2xl font-semibold text-white">{result?.toFixed(2) || "0.00"}</span>
              </div>
              <CurrencySelect value={toCurrency} onChange={setToCurrency} />
            </div>
          </div>

          <Button
            onClick={convertAndSave}
            disabled={loading || !amount || isNaN(Number(amount))}
            className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Convertendo..." : "Converter e Salvar"}
          </Button>

          {/* Exchange Rate Info */}
          {rate && (
            <div className="pt-4 border-t border-gray-800 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Taxa de câmbio</span>
                <span className="font-semibold text-white">
                  1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
                </span>
              </div>
              {lastUpdate && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>🕐</span>
                  <span>Atualizado às {lastUpdate.toLocaleTimeString("pt-BR")}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Recent Conversions from DB */}
      <RecentConversionsDB userId={user.id} refreshKey={refreshKey} />
    </div>
  )
}
