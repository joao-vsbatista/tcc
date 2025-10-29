"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Loader2 } from "lucide-react"

const currencies = ["USD", "BRL", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "ARS"]

export function CurrencyChart() {
  const [baseCurrency, setBaseCurrency] = useState("USD")
  const [targetCurrency, setTargetCurrency] = useState("BRL")
  const [period, setPeriod] = useState("7")
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchHistoricalData()
  }, [baseCurrency, targetCurrency, period])

  const fetchHistoricalData = async () => {
    setLoading(true)
    try {
      // Generate mock historical data (in production, use a real API)
      const days = Number.parseInt(period)
      const data = []
      const today = new Date()

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)

        // Fetch rate for this date (using current API as approximation)
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`)
        const apiData = await response.json()
        const rate = apiData.rates[targetCurrency]

        // Add some variation for historical simulation
        const variation = (Math.random() - 0.5) * 0.1
        const historicalRate = rate * (1 + variation)

        data.push({
          date: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
          taxa: Number.parseFloat(historicalRate.toFixed(4)),
        })
      }

      setChartData(data)
    } catch (error) {
      console.error("Error fetching historical data:", error)
    } finally {
      setLoading(false)
    }
  }

  const currentRate = chartData.length > 0 ? chartData[chartData.length - 1].taxa : 0
  const previousRate = chartData.length > 1 ? chartData[0].taxa : 0
  const change = currentRate - previousRate
  const changePercent = previousRate !== 0 ? ((change / previousRate) * 100).toFixed(2) : "0.00"

  return (
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Gráfico de Tendências</CardTitle>
        <CardDescription>Variação da taxa de câmbio ao longo do tempo</CardDescription>

        <div className="flex flex-col md:flex-row gap-3 mt-4">
          <Select value={baseCurrency} onValueChange={setBaseCurrency}>
            <SelectTrigger className="w-full md:w-40">
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

          <Select value={targetCurrency} onValueChange={setTargetCurrency}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Moeda alvo" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 dias</SelectItem>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!loading && chartData.length > 0 && (
          <div className="mt-4 p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa Atual</p>
                <p className="text-2xl font-bold">
                  {currentRate.toFixed(4)} {targetCurrency}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Variação ({period} dias)</p>
                <p className={`text-xl font-semibold ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {change >= 0 ? "+" : ""}
                  {changePercent}%
                </p>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-80">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="taxa"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
                name={`${baseCurrency} → ${targetCurrency}`}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
