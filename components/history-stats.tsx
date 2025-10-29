"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, DollarSign, Activity, Calendar } from "lucide-react"

interface Conversion {
  id: string
  from_currency: string
  to_currency: string
  amount: number
  result: number
  rate: number
  created_at: string
}

interface HistoryStatsProps {
  conversions: Conversion[]
}

export function HistoryStats({ conversions }: HistoryStatsProps) {
  const totalConversions = conversions.length

  const totalAmount = conversions.reduce((sum, conv) => sum + Number(conv.amount), 0)

  const uniquePairs = new Set(conversions.map((c) => `${c.from_currency}-${c.to_currency}`)).size

  const last7Days = conversions.filter((c) => {
    const date = new Date(c.created_at)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7
  }).length

  const stats = [
    {
      title: "Total de Conversões",
      value: totalConversions.toString(),
      icon: Activity,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Últimos 7 Dias",
      value: last7Days.toString(),
      icon: Calendar,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: "Pares Únicos",
      value: uniquePairs.toString(),
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Volume Total",
      value: totalAmount.toFixed(0),
      icon: DollarSign,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center mb-2`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
