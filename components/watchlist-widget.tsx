"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface WatchlistItem {
  id: string
  from_currency: string
  to_currency: string
  alert_enabled: boolean
  alert_rate: number | null
}

interface WatchlistWidgetProps {
  userId: string
}

export function WatchlistWidget({ userId }: WatchlistWidgetProps) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [rates, setRates] = useState<Record<string, number>>({})
  const supabase = createClient()

  useEffect(() => {
    fetchWatchlist()
  }, [userId])

  const fetchWatchlist = async () => {
    const { data } = await supabase.from("watchlist").select("*").eq("user_id", userId).limit(3)

    if (data) {
      setWatchlist(data)
      fetchRates(data)
    }
  }

  const fetchRates = async (items: WatchlistItem[]) => {
    const newRates: Record<string, number> = {}

    for (const item of items) {
      try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${item.from_currency}`)
        const apiData = await response.json()
        newRates[`${item.from_currency}-${item.to_currency}`] = apiData.rates[item.to_currency]
      } catch (error) {
        console.error("Error fetching rate:", error)
      }
    }

    setRates(newRates)
  }

  if (watchlist.length === 0) return null

  return (
    <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">Watchlist</CardTitle>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/watchlist">
              Ver Tudo
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {watchlist.map((item) => {
          const rateKey = `${item.from_currency}-${item.to_currency}`
          const currentRate = rates[rateKey]

          return (
            <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="font-semibold text-sm">
                  {item.from_currency}/{item.to_currency}
                </p>
                {item.alert_enabled && item.alert_rate && (
                  <p className="text-xs text-muted-foreground">Alerta: {item.alert_rate.toFixed(4)}</p>
                )}
              </div>
              <p className="text-lg font-bold">{currentRate ? currentRate.toFixed(4) : "..."}</p>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
