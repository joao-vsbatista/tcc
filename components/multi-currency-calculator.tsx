"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, Calculator } from "lucide-react"

const currencies = [
  { code: "USD", name: "Dólar Americano", symbol: "$" },
  { code: "BRL", name: "Real Brasileiro", symbol: "R$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "Libra Esterlina", symbol: "£" },
  { code: "JPY", name: "Iene Japonês", symbol: "¥" },
  { code: "CAD", name: "Dólar Canadense", symbol: "C$" },
  { code: "AUD", name: "Dólar Australiano", symbol: "A$" },
  { code: "CHF", name: "Franco Suíço", symbol: "CHF" },
  { code: "CNY", name: "Yuan Chinês", symbol: "¥" },
  { code: "ARS", name: "Peso Argentino", symbol: "$" },
]

interface MultiCurrencyCalculatorProps {
  userId: string
}

export function MultiCurrencyCalculator({ userId }: MultiCurrencyCalculatorProps) {
  const [amount, setAmount] = useState("100")
  const [baseCurrency, setBaseCurrency] = useState("USD")
  const [targetCurrencies, setTargetCurrencies] = useState(["BRL", "EUR", "GBP"])
  const [results, setResults] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    calculateAll()
  }, [amount, baseCurrency, targetCurrencies])

  const calculateAll = async () => {
    if (!amount || isNaN(Number(amount))) {
      setResults({})
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`)
      const data = await response.json()

      const newResults: Record<string, number> = {}
      for (const currency of targetCurrencies) {
        const rate = data.rates[currency]
        newResults[currency] = Number(amount) * rate
      }

      setResults(newResults)
    } catch (error) {
      console.error("Error calculating:", error)
    } finally {
      setLoading(false)
    }
  }

  const addCurrency = () => {
    const available = currencies.filter((c) => c.code !== baseCurrency && !targetCurrencies.includes(c.code))
    if (available.length > 0) {
      setTargetCurrencies([...targetCurrencies, available[0].code])
    }
  }

  const removeCurrency = (currency: string) => {
    setTargetCurrencies(targetCurrencies.filter((c) => c !== currency))
  }

  const updateTargetCurrency = (oldCurrency: string, newCurrency: string) => {
    setTargetCurrencies(targetCurrencies.map((c) => (c === oldCurrency ? newCurrency : c)))
  }

  const getCurrencyInfo = (code: string) => {
    return currencies.find((c) => c.code === code) || { code, name: code, symbol: code }
  }

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Valor Base
          </CardTitle>
          <CardDescription>Digite o valor que deseja converter</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-2xl font-semibold h-14 flex-1"
              placeholder="0.00"
            />
            <Select value={baseCurrency} onValueChange={setBaseCurrency}>
              <SelectTrigger className="w-32 h-14 text-lg font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {targetCurrencies.map((currency) => {
          const info = getCurrencyInfo(currency)
          const result = results[currency]

          return (
            <Card
              key={currency}
              className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm relative"
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={() => removeCurrency(currency)}
              >
                <X className="w-4 h-4" />
              </Button>
              <CardContent className="pt-6">
                <div className="mb-3">
                  <Select value={currency} onValueChange={(newCurrency) => updateTargetCurrency(currency, newCurrency)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies
                        .filter(
                          (c) => c.code !== baseCurrency && (!targetCurrencies.includes(c.code) || c.code === currency),
                        )
                        .map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.code} - {c.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-1">{info.name}</p>
                  <p className="text-3xl font-bold text-foreground">
                    {loading ? "..." : result ? `${info.symbol} ${result.toFixed(2)}` : "0.00"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {/* Add Currency Card */}
        {targetCurrencies.length < currencies.length - 1 && (
          <Card className="border-2 border-dashed border-muted-foreground/30 bg-transparent hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="flex items-center justify-center h-full min-h-40" onClick={addCurrency}>
              <div className="text-center">
                <Plus className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Adicionar Moeda</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
