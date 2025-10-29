"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { History } from "lucide-react"

interface Conversion {
  from: string
  to: string
  amount: number
  result: number
  rate: number
  timestamp: string
}

export function RecentConversions() {
  const [conversions, setConversions] = useState<Conversion[]>([])

  useEffect(() => {
    const stored = localStorage.getItem("recentConversions")
    if (stored) {
      setConversions(JSON.parse(stored))
    }
  }, [])

  if (conversions.length === 0) return null

  return (
    <Card className="p-4 shadow-lg border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">Conversões Recentes</h2>
      </div>
      <div className="space-y-3">
        {conversions.slice(0, 3).map((conversion, index) => (
          <div key={index} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {conversion.amount.toFixed(2)} {conversion.from}
              </span>
              <span className="text-muted-foreground">→</span>
              <span className="font-medium">
                {conversion.result.toFixed(2)} {conversion.to}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(conversion.timestamp).toLocaleDateString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
