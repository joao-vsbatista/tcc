"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { CurrencySelect } from "@/components/currency-select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface SettingsFormProps {
  user: {
    id: string
  }
  profile: {
    default_from_currency?: string
    default_to_currency?: string
    theme?: string
  } | null
}

export function SettingsForm({ user, profile }: SettingsFormProps) {
  const [defaultFrom, setDefaultFrom] = useState(profile?.default_from_currency || "USD")
  const [defaultTo, setDefaultTo] = useState(profile?.default_to_currency || "BRL")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          default_from_currency: defaultFrom,
          default_to_currency: defaultTo,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      setMessage({ type: "success", text: "Configurações salvas com sucesso!" })
      router.refresh()
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao salvar configurações" })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border border-gray-800 shadow-lg bg-gray-900 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white">Preferências de Conversão</CardTitle>
        <CardDescription className="text-gray-400">Defina suas moedas padrão</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-gray-300">Moeda Padrão (De)</Label>
            <CurrencySelect value={defaultFrom} onChange={setDefaultFrom} />
            <p className="text-xs text-gray-500">Moeda de origem padrão para conversões</p>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Moeda Padrão (Para)</Label>
            <CurrencySelect value={defaultTo} onChange={setDefaultTo} />
            <p className="text-xs text-gray-500">Moeda de destino padrão para conversões</p>
          </div>

          {message && (
            <div
              className={`text-sm p-3 rounded-lg ${
                message.type === "success"
                  ? "bg-green-900/30 text-green-400 border border-green-800"
                  : "bg-red-900/30 text-red-400 border border-red-800"
              }`}
            >
              {message.text}
            </div>
          )}

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="mr-2">⏳</span>
                Salvando...
              </>
            ) : (
              "Salvar Configurações"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
