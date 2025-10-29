"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

interface Conversion {
  id: string
  from_currency: string
  to_currency: string
  amount: number
  result: number
  rate: number
  created_at: string
}

interface RecentConversionsDBProps {
  userId: string
  refreshKey: number
}

export function RecentConversionsDB({ userId, refreshKey }: RecentConversionsDBProps) {
  const [conversions, setConversions] = useState<Conversion[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchConversions()
  }, [userId, refreshKey])

  const fetchConversions = async () => {
    const { data, error } = await supabase
      .from("conversion_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5)

    if (!error && data) {
      setConversions(data)
    }
  }

  if (conversions.length === 0) return null

  return (
    <Card className="p-4 shadow-lg border border-gray-800 bg-gray-900">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🕐</span>
        <h2 className="text-sm font-semibold text-white">Conversões Recentes</h2>
      </div>
      <div className="space-y-3">
        {conversions.slice(0, 3).map((conversion) => (
          <div
            key={conversion.id}
            className="flex items-center justify-between text-sm py-2 border-b border-gray-800 last:border-0"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">
                {Number(conversion.amount).toFixed(2)} {conversion.from_currency}
              </span>
              <span className="text-gray-500">→</span>
              <span className="font-medium text-white">
                {Number(conversion.result).toFixed(2)} {conversion.to_currency}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {new Date(conversion.created_at).toLocaleDateString("pt-BR", {
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
