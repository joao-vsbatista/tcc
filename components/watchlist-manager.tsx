"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Bell, BellOff, Star } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const currencies = ["USD", "BRL", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "ARS"]

interface WatchlistItem {
  id: string
  from_currency: string
  to_currency: string
  alert_enabled: boolean
  alert_rate: number | null
  created_at: string
}

interface WatchlistManagerProps {
  userId: string
  initialWatchlist: WatchlistItem[]
}

export function WatchlistManager({ userId, initialWatchlist }: WatchlistManagerProps) {
  const [watchlist, setWatchlist] = useState(initialWatchlist)
  const [rates, setRates] = useState<Record<string, number>>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [fromCurrency, setFromCurrency] = useState("USD")
  const [toCurrency, setToCurrency] = useState("BRL")
  const [alertEnabled, setAlertEnabled] = useState(false)
  const [alertRate, setAlertRate] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchRates()
    const interval = setInterval(fetchRates, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [watchlist])

  const fetchRates = async () => {
    const newRates: Record<string, number> = {}

    for (const item of watchlist) {
      try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${item.from_currency}`)
        const data = await response.json()
        const rate = data.rates[item.to_currency]
        newRates[`${item.from_currency}-${item.to_currency}`] = rate

        // Check if alert should trigger
        if (item.alert_enabled && item.alert_rate) {
          if (rate >= item.alert_rate) {
            // In production, send actual notification
            console.log(`Alert: ${item.from_currency}/${item.to_currency} reached ${rate}`)
          }
        }
      } catch (error) {
        console.error("Error fetching rate:", error)
      }
    }

    setRates(newRates)
  }

  const handleAdd = async () => {
    if (fromCurrency === toCurrency) {
      alert("Selecione moedas diferentes")
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("watchlist")
        .insert({
          user_id: userId,
          from_currency: fromCurrency,
          to_currency: toCurrency,
          alert_enabled: alertEnabled,
          alert_rate: alertEnabled && alertRate ? Number.parseFloat(alertRate) : null,
        })
        .select()
        .single()

      if (error) throw error

      setWatchlist([data, ...watchlist])
      setShowAddForm(false)
      setAlertEnabled(false)
      setAlertRate("")
      router.refresh()
    } catch (error: any) {
      if (error.code === "23505") {
        alert("Este par de moedas já está na sua watchlist")
      } else {
        alert("Erro ao adicionar à watchlist")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("watchlist").delete().eq("id", id)

    if (!error) {
      setWatchlist(watchlist.filter((item) => item.id !== id))
      router.refresh()
    }
  }

  const handleToggleAlert = async (id: string, enabled: boolean) => {
    const { error } = await supabase.from("watchlist").update({ alert_enabled: enabled }).eq("id", id)

    if (!error) {
      setWatchlist(watchlist.map((item) => (item.id === id ? { ...item, alert_enabled: enabled } : item)))
      router.refresh()
    }
  }

  const handleUpdateAlertRate = async (id: string, rate: string) => {
    const numRate = Number.parseFloat(rate)
    if (isNaN(numRate)) return

    const { error } = await supabase.from("watchlist").update({ alert_rate: numRate }).eq("id", id)

    if (!error) {
      setWatchlist(watchlist.map((item) => (item.id === id ? { ...item, alert_rate: numRate } : item)))
      router.refresh()
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Button */}
      {!showAddForm && (
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <Button onClick={() => setShowAddForm(true)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Par de Moedas
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Form */}
      {showAddForm && (
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Adicionar à Watchlist</CardTitle>
            <CardDescription>Escolha um par de moedas para acompanhar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Moeda Base</Label>
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger>
                    <SelectValue />
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

              <div className="space-y-2">
                <Label>Moeda Alvo</Label>
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger>
                    <SelectValue />
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
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
              <div className="space-y-0.5">
                <Label>Ativar Alerta de Preço</Label>
                <p className="text-xs text-muted-foreground">Receba notificação quando atingir a taxa</p>
              </div>
              <Switch checked={alertEnabled} onCheckedChange={setAlertEnabled} />
            </div>

            {alertEnabled && (
              <div className="space-y-2">
                <Label>Taxa de Alerta</Label>
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="Ex: 5.2500"
                  value={alertRate}
                  onChange={(e) => setAlertRate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Você será notificado quando a taxa atingir ou ultrapassar este valor
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={handleAdd} disabled={isLoading} className="flex-1">
                {isLoading ? "Adicionando..." : "Adicionar"}
              </Button>
              <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1">
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Watchlist Items */}
      {watchlist.length === 0 ? (
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <CardContent className="py-12 text-center">
            <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Sua watchlist está vazia</p>
            <p className="text-sm text-muted-foreground mt-2">Adicione pares de moedas para acompanhar</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {watchlist.map((item) => {
            const rateKey = `${item.from_currency}-${item.to_currency}`
            const currentRate = rates[rateKey]
            const alertTriggered = item.alert_enabled && item.alert_rate && currentRate >= item.alert_rate

            return (
              <Card
                key={item.id}
                className={`border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm ${
                  alertTriggered ? "ring-2 ring-green-500" : ""
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold">
                          {item.from_currency} / {item.to_currency}
                        </h3>
                        {alertTriggered && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            Alerta Acionado
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Taxa Atual</p>
                          <p className="text-xl font-semibold">{currentRate ? currentRate.toFixed(4) : "..."}</p>
                        </div>
                        {item.alert_rate && (
                          <div>
                            <p className="text-sm text-muted-foreground">Taxa de Alerta</p>
                            <p className="text-xl font-semibold">{item.alert_rate.toFixed(4)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      {item.alert_enabled ? (
                        <Bell className="w-4 h-4 text-green-600" />
                      ) : (
                        <BellOff className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="text-sm text-muted-foreground">
                        {item.alert_enabled ? "Alerta ativo" : "Alerta desativado"}
                      </span>
                    </div>
                    <Switch
                      checked={item.alert_enabled}
                      onCheckedChange={(checked) => handleToggleAlert(item.id, checked)}
                    />
                  </div>

                  {item.alert_enabled && (
                    <div className="mt-4 space-y-2">
                      <Label className="text-xs">Atualizar Taxa de Alerta</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          step="0.0001"
                          placeholder="Nova taxa"
                          defaultValue={item.alert_rate || ""}
                          onBlur={(e) => e.target.value && handleUpdateAlertRate(item.id, e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
