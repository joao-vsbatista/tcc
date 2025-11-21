"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { MobileNavBar } from "@/components/mobile-nav-bar"
import Link from "next/link"

const CURRENCIES = ["BRL", "USD", "EUR", "GBP", "JPY", "ARS", "CLP", "MXN"]

type PaymentMethod = "cash" | "credit" | "debit" | "transfer"

interface FeeCalculation {
  baseAmount: number
  exchangeRate: number
  convertedAmount: number
  iof: number
  spread: number
  transactionFee: number
  totalCost: number
  effectiveRate: number
}

export default function FeesPage() {
  const [amount, setAmount] = useState("1000")
  const [fromCurrency, setFromCurrency] = useState("BRL")
  const [toCurrency, setToCurrency] = useState("USD")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit")
  const [rates, setRates] = useState<Record<string, number>>({})
  const [calculation, setCalculation] = useState<FeeCalculation | null>(null)

  useEffect(() => {
    fetchRates()
  }, [fromCurrency])

  const fetchRates = async () => {
    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`)
      const data = await response.json()
      setRates(data.rates)
    } catch (error) {
      console.error("Error fetching rates:", error)
    }
  }

  const calculateFees = () => {
    const baseAmount = parseFloat(amount)
    if (!baseAmount || !rates[toCurrency]) return

    const baseRate = rates[toCurrency]
    
    let iofRate = 0
    let spreadRate = 0
    let transactionFeeRate = 0

    switch (paymentMethod) {
      case "cash":
        spreadRate = 0.03 // 3% de spread (diferença compra/venda)
        transactionFeeRate = 0
        iofRate = 0.0038 // 0.38% IOF para dinheiro
        break
      case "credit":
        spreadRate = 0.04 // 4% de spread
        transactionFeeRate = 0.0399 // 3.99% taxa internacional
        iofRate = 0.0638 // 6.38% IOF para cartão de crédito
        break
      case "debit":
        spreadRate = 0.035 // 3.5% de spread
        transactionFeeRate = 0.03 // 3% taxa internacional
        iofRate = 0.0638 // 6.38% IOF para cartão de débito
        break
      case "transfer":
        spreadRate = 0.02 // 2% de spread
        transactionFeeRate = 25 // Taxa fixa de R$ 25
        iofRate = 0.0138 // 1.38% IOF para transferência
        break
    }

    // Cálculo passo a passo
    const convertedAmount = baseAmount * baseRate
    const spreadAmount = convertedAmount * spreadRate
    const iofAmount = baseAmount * iofRate
    const transactionFee = paymentMethod === "transfer" ? transactionFeeRate : baseAmount * transactionFeeRate
    
    const totalCost = baseAmount + iofAmount + transactionFee
    const effectiveAmount = convertedAmount - spreadAmount
    const effectiveRate = effectiveAmount / baseAmount

    setCalculation({
      baseAmount,
      exchangeRate: baseRate,
      convertedAmount,
      iof: iofAmount,
      spread: spreadAmount,
      transactionFee,
      totalCost,
      effectiveRate,
    })
  }

  useEffect(() => {
    if (rates[toCurrency]) {
      calculateFees()
    }
  }, [amount, fromCurrency, toCurrency, paymentMethod, rates])

  const paymentMethodLabels = {
    cash: "Dinheiro (Casa de Câmbio)",
    credit: "Cartão de Crédito",
    debit: "Cartão de Débito",
    transfer: "Transferência Internacional",
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="container max-w-md mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard" className="text-gray-400 hover:text-white">
            ← Voltar
          </Link>
          <h1 className="text-2xl font-bold">Simulador de Taxas</h1>
        </div>

        <div className="space-y-6">
          {/* Input de valor */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <label className="block text-sm text-gray-400 mb-2">Valor a converter</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-xl font-semibold"
              placeholder="0.00"
            />
          </div>

          {/* Seleção de moedas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <label className="block text-sm text-gray-400 mb-2">De</label>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <label className="block text-sm text-gray-400 mb-2">Para</label>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Método de pagamento */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <label className="block text-sm text-gray-400 mb-3">Método de Pagamento</label>
            <div className="space-y-2">
              {(Object.keys(paymentMethodLabels) as PaymentMethod[]).map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    paymentMethod === method
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {paymentMethodLabels[method]}
                </button>
              ))}
            </div>
          </div>

          {/* Resultado do cálculo */}
          {calculation && (
            <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl p-6 border border-blue-800/50">
              <h3 className="text-lg font-semibold mb-4">Breakdown de Custos</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                  <span className="text-gray-400">Taxa de câmbio base</span>
                  <span className="font-semibold">
                    1 {fromCurrency} = {calculation.exchangeRate.toFixed(4)} {toCurrency}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Valor convertido</span>
                  <span>{calculation.convertedAmount.toFixed(2)} {toCurrency}</span>
                </div>

                <div className="flex justify-between items-center text-red-400">
                  <span>IOF ({paymentMethod === "credit" || paymentMethod === "debit" ? "6.38%" : paymentMethod === "transfer" ? "1.38%" : "0.38%"})</span>
                  <span>- {calculation.iof.toFixed(2)} {fromCurrency}</span>
                </div>

                <div className="flex justify-between items-center text-red-400">
                  <span>Spread bancário</span>
                  <span>- {calculation.spread.toFixed(2)} {toCurrency}</span>
                </div>

                <div className="flex justify-between items-center text-red-400">
                  <span>Taxa de transação</span>
                  <span>
                    - {paymentMethod === "transfer" 
                      ? `${calculation.transactionFee.toFixed(2)} ${fromCurrency}` 
                      : `${calculation.transactionFee.toFixed(2)} ${fromCurrency}`}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                  <span className="text-gray-400">Custo total em {fromCurrency}</span>
                  <span className="text-xl font-bold">{calculation.totalCost.toFixed(2)} {fromCurrency}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Taxa efetiva real</span>
                  <span className="text-lg font-semibold text-yellow-400">
                    1 {fromCurrency} = {calculation.effectiveRate.toFixed(4)} {toCurrency}
                  </span>
                </div>

                <div className="mt-4 p-4 bg-gray-900/50 rounded-lg">
                  <p className="text-sm text-gray-400">
                    <span className="text-yellow-400 font-semibold">Diferença:</span> Você paga{" "}
                    {((calculation.totalCost / calculation.baseAmount - 1) * 100).toFixed(2)}% a mais
                    devido a taxas e spread bancário
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Dicas */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold mb-3">💡 Dicas para Economizar</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Transferências internacionais têm menor IOF (1.38%)</li>
              <li>• Evite usar cartão de crédito no exterior (IOF de 6.38%)</li>
              <li>• Compare o spread de diferentes casas de câmbio</li>
              <li>• Considere usar fintechs para transferências mais baratas</li>
            </ul>
          </div>
        </div>
      </div>

      <MobileNavBar />
    </div>
  )
}
