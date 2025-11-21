"use client"

import { useState, useEffect } from "react"
import { MobileNavBar } from "@/components/mobile-nav-bar"
import { CurrencySelect } from "@/components/currency-select"
import { Input } from "@/components/ui/input"

export default function SimulatorPage() {
  const [amount, setAmount] = useState("")
  const [fromCurrency, setFromCurrency] = useState("USD")
  const [toCurrency, setToCurrency] = useState("BRL")
  const [result, setResult] = useState<number | null>(null)
  const [rate, setRate] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"dinheiro" | "credito" | "debito" | "transferencia">("credito")

  useEffect(() => {
    if (amount && Number(amount) > 0) {
      calculateSimulation()
    } else {
      setResult(null)
    }
  }, [fromCurrency, toCurrency, amount, paymentMethod])

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

    const iofAmount = baseAmount * iofRate
    const spreadAmount = baseAmount * spreadRate
    const transactionAmount = baseAmount * transactionFee
    const totalFees = iofAmount + spreadAmount + transactionAmount
    const finalAmount = baseAmount + totalFees

    return {
      finalAmount,
      iofAmount,
      spreadAmount,
      transactionAmount,
      totalFees,
      totalFeeRate: iofRate + spreadRate + transactionFee,
    }
  }

  const calculateSimulation = async () => {
    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`)
      const data = await response.json()
      const exchangeRate = data.rates[toCurrency]
      const convertedAmount = Number(amount) * exchangeRate

      const { finalAmount } = calculateFees(convertedAmount, paymentMethod)

      setRate(exchangeRate)
      setResult(finalAmount)
    } catch (error) {
      console.error("Error simulating:", error)
    }
  }

  const feeBreakdown = result && rate ? calculateFees(Number(amount) * rate, paymentMethod) : null

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Simulador de Conversão</h1>
          <p className="text-gray-400">Simule conversões e veja as taxas aplicadas sem afetar seu saldo</p>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-6">
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
              className="w-10 h-10 rounded-full border-2 border-gray-700 hover:bg-gray-800 flex items-center justify-center text-white transition-colors"
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

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Método de Pagamento</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "dinheiro", label: "Dinheiro" },
                { value: "credito", label: "Cartão Crédito" },
                { value: "debito", label: "Cartão Débito" },
                { value: "transferencia", label: "Transferência" },
              ].map((method) => (
                <button
                  key={method.value}
                  onClick={() => setPaymentMethod(method.value as any)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    paymentMethod === method.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          {feeBreakdown && (
            <div className="bg-gray-800 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-white mb-3">Detalhamento de Taxas</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Taxa base</span>
                  <span className="text-white">
                    {toCurrency} {(Number(amount) * (rate || 0)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">IOF</span>
                  <span className="text-orange-400">+{feeBreakdown.iofAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Spread bancário</span>
                  <span className="text-orange-400">+{feeBreakdown.spreadAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Taxa de transação</span>
                  <span className="text-orange-400">+{feeBreakdown.transactionAmount.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-700 pt-2 flex justify-between font-semibold">
                  <span className="text-white">Total a pagar</span>
                  <span className="text-white">
                    {toCurrency} {feeBreakdown.finalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Taxa efetiva</span>
                  <span className="text-red-400">{(feeBreakdown.totalFeeRate * 100).toFixed(2)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <MobileNavBar />
    </div>
  )
}
