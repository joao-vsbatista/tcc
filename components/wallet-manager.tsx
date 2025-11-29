"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const CURRENCIES = [
  { code: "USD", name: "Dólar Americano", symbol: "$" },
  { code: "BRL", name: "Real Brasileiro", symbol: "R$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "Libra Esterlina", symbol: "£" },
  { code: "JPY", name: "Iene Japonês", symbol: "¥" },
  { code: "CAD", name: "Dólar Canadense", symbol: "C$" },
  { code: "AUD", name: "Dólar Australiano", symbol: "A$" },
  { code: "CHF", name: "Franco Suíço", symbol: "CHF" },
]

interface WalletBalance {
  id: string
  currency: string
  balance: number
}

interface WalletManagerProps {
  userId: string
  initialWalletData: WalletBalance[]
}

export function WalletManager({ userId, initialWalletData }: WalletManagerProps) {
  const [walletData, setWalletData] = useState<WalletBalance[]>(initialWalletData)
  const [showAddBalance, setShowAddBalance] = useState(false)
  const [showConvert, setShowConvert] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState("USD")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)

  // Convert state
  const [fromCurrency, setFromCurrency] = useState("")
  const [toCurrency, setToCurrency] = useState("")
  const [convertAmount, setConvertAmount] = useState("")
  const [convertResult, setConvertResult] = useState<number | null>(null)
  const [exchangeRate, setExchangeRate] = useState<number | null>(null)

  const supabase = createClient()

  const totalValueUSD = walletData.reduce((acc, item) => {
    // Simplified: assuming we'd fetch real rates
    return acc + item.balance
  }, 0)

  const getCurrencySymbol = (code: string) => {
    return CURRENCIES.find((c) => c.code === code)?.symbol || code
  }

  const handleAddBalance = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return

    setLoading(true)
    try {
      const existingBalance = walletData.find((w) => w.currency === selectedCurrency)

      if (existingBalance) {
        // Update existing balance
        const newBalance = existingBalance.balance + Number(amount)
        const { error } = await supabase
          .from("wallet")
          .update({ balance: newBalance, updated_at: new Date().toISOString() })
          .eq("id", existingBalance.id)

        if (!error) {
          setWalletData(
            walletData.map((w) => (w.id === existingBalance.id ? { ...w, balance: newBalance } : w))
          )
        }
      } else {
        // Insert new balance
        const { data, error } = await supabase
          .from("wallet")
          .insert({
            user_id: userId,
            currency: selectedCurrency,
            balance: Number(amount),
          })
          .select()
          .single()

        if (!error && data) {
          setWalletData([...walletData, data])
        }
      }

      // Record transaction
      await supabase.from("wallet_transactions").insert({
        user_id: userId,
        from_currency: selectedCurrency,
        to_currency: selectedCurrency,
        from_amount: Number(amount),
        to_amount: Number(amount),
        rate: 1,
        transaction_type: "deposit",
      })

      setAmount("")
      setShowAddBalance(false)
    } catch (error) {
      console.error("Error adding balance:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateConversion = async () => {
    if (!convertAmount || !fromCurrency || !toCurrency) return

    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`)
      const data = await response.json()
      const rate = data.rates[toCurrency]
      const result = Number(convertAmount) * rate

      setExchangeRate(rate)
      setConvertResult(result)
    } catch (error) {
      console.error("Error calculating conversion:", error)
    }
  }

  useEffect(() => {
    if (fromCurrency && toCurrency && convertAmount) {
      calculateConversion()
    }
  }, [fromCurrency, toCurrency, convertAmount])

  const handleConvert = async () => {
    if (!convertAmount || !fromCurrency || !toCurrency || !exchangeRate || !convertResult) return

    const fromBalance = walletData.find((w) => w.currency === fromCurrency)
    if (!fromBalance || fromBalance.balance < Number(convertAmount)) {
      alert("Saldo insuficiente")
      return
    }

    setLoading(true)
    try {
      // Decrease from currency balance
      const newFromBalance = fromBalance.balance - Number(convertAmount)
      await supabase
        .from("wallet")
        .update({ balance: newFromBalance, updated_at: new Date().toISOString() })
        .eq("id", fromBalance.id)

      // Increase to currency balance
      const toBalance = walletData.find((w) => w.currency === toCurrency)
      if (toBalance) {
        const newToBalance = toBalance.balance + convertResult
        await supabase
          .from("wallet")
          .update({ balance: newToBalance, updated_at: new Date().toISOString() })
          .eq("id", toBalance.id)

        setWalletData(
          walletData.map((w) => {
            if (w.id === fromBalance.id) return { ...w, balance: newFromBalance }
            if (w.id === toBalance.id) return { ...w, balance: newToBalance }
            return w
          })
        )
      } else {
        const { data } = await supabase
          .from("wallet")
          .insert({
            user_id: userId,
            currency: toCurrency,
            balance: convertResult,
          })
          .select()
          .single()

        if (data) {
          setWalletData([
            ...walletData.map((w) =>
              w.id === fromBalance.id ? { ...w, balance: newFromBalance } : w
            ),
            data,
          ])
        }
      }

      // Record transaction
      await supabase.from("wallet_transactions").insert({
        user_id: userId,
        from_currency: fromCurrency,
        to_currency: toCurrency,
        from_amount: Number(convertAmount),
        to_amount: convertResult,
        rate: exchangeRate,
        transaction_type: "convert",
      })

      setConvertAmount("")
      setFromCurrency("")
      setToCurrency("")
      setConvertResult(null)
      setExchangeRate(null)
      setShowConvert(false)
    } catch (error) {
      console.error("Error converting:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Valor Total Estimado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-white">${totalValueUSD.toFixed(2)} USD</p>
          <p className="text-sm text-gray-400 mt-1">{walletData.length} moedas na carteira</p>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => setShowAddBalance(!showAddBalance)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
           Adicionar Saldo
        </Button>
        <Button
          onClick={() => setShowConvert(!showConvert)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          disabled={walletData.length === 0}
        >
           Converter
        </Button>
      </div>

      {/* Add Balance Form */}
      {showAddBalance && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Adicionar Saldo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Moeda</label>
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code} className="text-white">
                      {currency.symbol} {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Valor</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Button
              onClick={handleAddBalance}
              disabled={loading || !amount}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? "Adicionando..." : "Confirmar"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Convert Form */}
      {showConvert && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Converter Moedas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">De</label>
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Selecione a moeda" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {walletData.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.currency} className="text-white">
                      {getCurrencySymbol(wallet.currency)} {wallet.currency} - Saldo:{" "}
                      {wallet.balance.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Valor</label>
              <Input
                type="number"
                value={convertAmount}
                onChange={(e) => setConvertAmount(e.target.value)}
                placeholder="0.00"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Para</label>
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Selecione a moeda" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {CURRENCIES.filter((c) => c.code !== fromCurrency).map((currency) => (
                    <SelectItem key={currency.code} value={currency.code} className="text-white">
                      {currency.symbol} {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {convertResult && exchangeRate && (
              <div className="p-3 bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-400">Você receberá</p>
                <p className="text-2xl font-bold text-white">
                  {getCurrencySymbol(toCurrency)} {convertResult.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Taxa: 1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                </p>
              </div>
            )}
            <Button
              onClick={handleConvert}
              disabled={loading || !convertAmount || !fromCurrency || !toCurrency}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Convertendo..." : "Confirmar Conversão"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Wallet Balances */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-white">Seus Saldos</h2>
        {walletData.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="py-8 text-center">
              <p className="text-gray-400">Nenhum saldo na carteira</p>
              <p className="text-sm text-gray-500 mt-1">Adicione saldo para começar</p>
            </CardContent>
          </Card>
        ) : (
          walletData.map((wallet) => (
            <Card key={wallet.id} className="bg-gray-900 border-gray-800 hover:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">{wallet.currency}</p>
                    <p className="text-2xl font-bold text-white">
                      {getCurrencySymbol(wallet.currency)} {wallet.balance.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-4xl">
                    {wallet.currency === "USD"}
                    {wallet.currency === "BRL"}
                    {wallet.currency === "EUR"}
                    {wallet.currency === "GBP"}
                    {wallet.currency === "JPY"}
                    {!["USD", "BRL", "EUR", "GBP", "JPY"].includes(wallet.currency)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
