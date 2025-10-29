"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Download, Search, Filter } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Conversion {
  id: string
  from_currency: string
  to_currency: string
  amount: number
  result: number
  rate: number
  created_at: string
}

interface HistoryListProps {
  conversions: Conversion[]
  userId: string
}

export function HistoryList({ conversions: initialConversions, userId }: HistoryListProps) {
  const [conversions, setConversions] = useState(initialConversions)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCurrency, setFilterCurrency] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const supabase = createClient()
  const router = useRouter()

  const currencies = Array.from(new Set(conversions.flatMap((c) => [c.from_currency, c.to_currency]))).sort()

  const filteredConversions = conversions
    .filter((c) => {
      const matchesSearch =
        c.from_currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.to_currency.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCurrency =
        filterCurrency === "all" || c.from_currency === filterCurrency || c.to_currency === filterCurrency
      return matchesSearch && matchesCurrency
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      } else if (sortBy === "amount") {
        return Number(b.amount) - Number(a.amount)
      }
      return 0
    })

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta conversão?")) return

    const { error } = await supabase.from("conversion_history").delete().eq("id", id)

    if (!error) {
      setConversions(conversions.filter((c) => c.id !== id))
      router.refresh()
    }
  }

  const handleExportCSV = () => {
    const csv = [
      ["Data", "De", "Para", "Valor", "Resultado", "Taxa"],
      ...filteredConversions.map((c) => [
        new Date(c.created_at).toLocaleString("pt-BR"),
        c.from_currency,
        c.to_currency,
        c.amount,
        c.result,
        c.rate,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `conversoes-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  return (
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle>Todas as Conversões</CardTitle>
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar moedas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterCurrency} onValueChange={setFilterCurrency}>
            <SelectTrigger className="w-full md:w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {currencies.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Data</SelectItem>
              <SelectItem value="amount">Valor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {filteredConversions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma conversão encontrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredConversions.map((conversion) => (
              <div
                key={conversion.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-lg">
                      {Number(conversion.amount).toFixed(2)} {conversion.from_currency}
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-semibold text-lg">
                      {Number(conversion.result).toFixed(2)} {conversion.to_currency}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Taxa: {Number(conversion.rate).toFixed(4)}</span>
                    <span>
                      {new Date(conversion.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(conversion.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
