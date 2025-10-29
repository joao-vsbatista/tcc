"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface ProfileFormProps {
  user: {
    id: string
    email?: string
  }
  profile: {
    display_name?: string
    default_from_currency?: string
    default_to_currency?: string
  } | null
}

export function ProfileForm({ user, profile }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(profile?.display_name || "")
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
          display_name: displayName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      setMessage({ type: "success", text: "Perfil atualizado com sucesso!" })
      router.refresh()
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao atualizar perfil" })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border border-gray-800 shadow-lg bg-gray-900 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white">Informações Pessoais</CardTitle>
        <CardDescription className="text-gray-400">Atualize seus dados de perfil</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="bg-gray-800 text-gray-400 border-gray-700"
            />
            <p className="text-xs text-gray-500">O email não pode ser alterado</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-gray-300">
              Nome de Exibição
            </Label>
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Seu nome"
              required
              className="bg-gray-800 text-white border-gray-700 placeholder:text-gray-500"
            />
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
              "Salvar Alterações"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
