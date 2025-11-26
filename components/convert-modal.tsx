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
  const [includeFees, setIncludeFees] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<"dinheiro" | "credito" | "debito" | "transferencia">("credito")

  const supabase = createClient()

  useEffect(() => {
    if (amount && Number(amount) > 0) {
      calculatePreview()
    }
  }, [fromCurrency, toCurrency, amount, includeFees, paymentMethod])

  const calculateFees = (baseAmount: number, method: string) => {
    let iofRate = 0
    let spreadRate = 0
    let transactionFee = 0

    switch (method) {
      case "dinheiro":
        iofRate = 0.0011
        spreadRate = 0.04
        break
      case "credito":
        iofRate = 0.0638
        spreadRate = 0.04
        transactionFee = 0.02
        break
      case "debito":
        iofRate = 0.0638
        spreadRate = 0.03
        transactionFee = 0.015
        break
      case "transferencia":
        iofRate = 0.0038
        spreadRate = 0.02
        transactionFee = 0.01
        break
    }

    const totalFeeRate = iofRate + spreadRate + transactionFee
    const totalFees = baseAmount * totalFeeRate
    const finalAmount = baseAmount + totalFees

    return { finalAmount, totalFeeRate }
  }

  const calculatePreview = async () => {
    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`)
      const data = await response.json()
      const exchangeRate = data.rates[toCurrency]
      let convertedAmount = Number(amount) * exchangeRate

      if (includeFees) {
        const { finalAmount } = calculateFees(convertedAmount, paymentMethod)
        convertedAmount = finalAmount
      }

      setRate(exchangeRate)
      setResult(convertedAmount)
    } catch (error) {
      console.error("Error calculating preview:", error)
    }
  }

  const handleConvert = async () => {
    if (!amount || Number(amount) <= 0 || !result) return

    setLoading(true)
    try {
      await supabase.from("conversion_history").insert({
        user_id: userId,
        from_currency: fromCurrency,
        to_currency: toCurrency,
        amount: Number(amount),
        result: result,
        rate: rate || 0,
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

          <div className="pt-4 border-t border-gray-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-white">Incluir Taxas</label>
                <p className="text-xs text-gray-500">IOF + Spread</p>
              </div>
              <button
                onClick={() => setIncludeFees(!includeFees)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  includeFees ? "bg-blue-600" : "bg-gray-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    includeFees ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {includeFees && (
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "dinheiro", label: "Dinheiro" },
                  { value: "credito", label: "Crédito" },
                  { value: "debito", label: "Débito" },
                  { value: "transferencia", label: "Transfer" },
                ].map((method) => (
                  <button
                    key={method.value}
                    onClick={() => setPaymentMethod(method.value as any)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      paymentMethod === method.value ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-400 font-semibold hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConvert}
              disabled={loading || !amount || Number(amount) <= 0}
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
