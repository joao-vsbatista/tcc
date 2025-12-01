"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { CurrencySelect } from "@/components/currency-select"
import { Input } from "@/components/ui/input"

interface ConvertModalProps {
  userId: string
  profile: any
  onClose: () => void
}

export function ConvertModal({ userId, profile, onClose }: ConvertModalProps) {
  const [amount, setAmount] = useState("")
  const [fromCurrency, setFromCurrency] = useState("USD")
  const [toCurrency, setToCurrency] = useState("BRL")
  const [result, setResult] = useState<number | null>(null)
  const [rate, setRate] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [fromBalance, setFromBalance] = useState<number>(0)
  const [toBalance, setToBalance] = useState<number>(0)

  const supabase = createClient()

  useEffect(() => {
    loadBalances()
  }, [fromCurrency, toCurrency])

  const loadBalances = async () => {
    const { data: wallets } = await supabase
      .from("wallet")
      .select("currency, balance")
      .eq("user_id", userId)
      .in("currency", [fromCurrency, toCurrency])

    const from = wallets?.find((w) => w.currency === fromCurrency)
    const to = wallets?.find((w) => w.currency === toCurrency)

    setFromBalance(from?.balance || 0)
    setToBalance(to?.balance || 0)
  }

  useEffect(() => {
    if (amount && Number(amount) > 0) {
      calculatePreview()
    }
  }, [fromCurrency, toCurrency, amount])

  const calculateFees = (baseAmount: number) => {
    const spreadRate = 0.04
    const conversionFee = 0.01
    const totalFeeRate = spreadRate + conversionFee

    const totalFees = baseAmount * totalFeeRate
    const finalAmount = baseAmount - totalFees

    return { finalAmount, totalFeeRate, totalFees }
  }

  const calculatePreview = async () => {
    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`)
      const data = await response.json()
      const exchangeRate = data.rates[toCurrency]
      let convertedAmount = Number(amount) * exchangeRate

      const { finalAmount, totalFees } = calculateFees(convertedAmount)
      convertedAmount = finalAmount

      setRate(exchangeRate)
      setResult(convertedAmount)
    } catch (error) {
      console.error("Error calculating preview:", error)
    }
  }

  const handleConvert = async () => {
    if (!amount || Number(amount) <= 0 || !result) return

    if (fromBalance < Number(amount)) {
      alert("Saldo insuficiente")
      return
    }

    setLoading(true)
    try {
      await supabase
        .from("wallet")
        .update({ balance: fromBalance - Number(amount) })
        .eq("user_id", userId)
        .eq("currency", fromCurrency)


      const { data: existingWallet } = await supabase
        .from("wallet")
        .select("id")
        .eq("user_id", userId)
        .eq("currency", toCurrency)
        .single()

      if (existingWallet) {
        await supabase
          .from("wallet")
          .update({ balance: toBalance + (result || 0) })
          .eq("user_id", userId)
          .eq("currency", toCurrency)
      } else {
        await supabase.from("wallet").insert({
          user_id: userId,
          currency: toCurrency,
          balance: result || 0,
        })
      }


      await supabase.from("conversion_history").insert({
        user_id: userId,
        from_currency: fromCurrency,
        to_currency: toCurrency,
        amount: Number(amount),
        result: result,
        rate: rate || 0,
      })


      await supabase.from("wallet_transactions").insert({
        user_id: userId,
        type: "convert",
        currency: fromCurrency,
        amount: Number(amount),
        method: "wallet",
      })

      window.location.reload()
    } catch (error) {
      console.error("Error converting:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-800 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-6">Converter Moedas</h2>

        <div className="space-y-4">
          <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
            <p className="text-xs text-blue-400">Saldo disponível em {fromCurrency}</p>
            <p className="text-lg font-bold text-white">
              {fromBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">De</label>
            <div className="flex gap-3">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="text-xl h-12 bg-gray-800 border-gray-700 text-white"
              />
              <CurrencySelect value={fromCurrency} onChange={setFromCurrency} />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => {
                setFromCurrency(toCurrency)
                setToCurrency(fromCurrency)
              }}
              className="w-10 h-10 rounded-full border-2 border-gray-700 hover:bg-gray-800 flex items-center justify-center text-white"
            >
              ⇅
            </button>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Para</label>
            <div className="flex gap-3">
              <div className="flex-1 h-12 rounded-lg border border-gray-700 bg-gray-800 px-4 flex items-center">
                <span className="text-xl font-semibold text-white">{result?.toFixed(2) || "0.00"}</span>
              </div>
              <CurrencySelect value={toCurrency} onChange={setToCurrency} />
            </div>
          </div>

          {result && (
            <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3 text-xs">
              <p className="text-yellow-400 font-semibold mb-1">Taxas aplicadas: 5%</p>
              <p className="text-gray-400">4% spread bancário + 1% taxa de conversão</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-400 font-semibold hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConvert}
              disabled={loading || !amount || Number(amount) <= 0 || fromBalance < Number(amount)}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all"
            >
              {loading ? "Convertendo..." : "Converter"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
