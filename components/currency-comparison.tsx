"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown } from "lucide-react"

const currencies = ["USD", "BRL", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "ARS"]

export function CurrencyComparison() {
  const [baseCurrency, setBaseCurrency] = useState("USD")
  const [comparisonData, setComparisonData] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchComparison()
  }, [baseCurrency])

  const fetchComparison = async () => {
    setLoading(true)
    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`)
      const data = await response.json()
      setComparisonData(data.rates)
    } catch (error) {
      console.error("Error fetching comparison:", error)
    } finally {
      setLoading(false)
    }
  }

  const sortedCurrencies = currencies
    .filter((c) => c !== baseCurrency)
    .sort((a, b) => {
      const rateA = comparisonData[a] || 0
      const rateB = comparisonData[b] || 0
      return rateB - rateA
    })

  return (
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Comparação de Taxas</CardTitle>
        <CardDescription>Veja como outras moedas se comparam à moeda base</CardDescription>

        <div className="mt-4">
          <Select value={baseCurrency} onValueChange={setBaseCurrency}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Moeda base" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedCurrencies.map((currency) => {
              const rate = comparisonData[currency]
              const isHigh = rate > 1

              return (
                <div
                  key={currency}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isHigh ? "bg-green-100 dark:bg-green-900/20" : "bg-blue-100 dark:bg-blue-900/20"
                      }`}
                    >
                      {isHigh ? (
                        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{currency}</p>
                      <p className="text-sm text-muted-foreground">
                        1 {baseCurrency} = {rate?.toFixed(4)} {currency}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{rate?.toFixed(4)}</p>
                    <p className="text-xs text-muted-foreground">{isHigh ? "Mais forte" : "Mais fraco"}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
