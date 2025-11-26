"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { useState } from "react"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      return
    }

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      setSuccess(true)
      
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao redefinir senha")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-black">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-2">
              <span className="text-4xl">🔑</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Nova Senha</h1>
            <p className="text-sm text-gray-400">Digite sua nova senha</p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            {success ? (
              <div className="flex flex-col gap-4">
                <div className="text-sm text-green-400 bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                  Senha redefinida com sucesso! Redirecionando para login...
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetPassword}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <label htmlFor="password" className="text-sm font-medium text-gray-300">
                      Nova Senha
                    </label>
                    <input
                      id="password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10 px-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300">
                      Confirmar Senha
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder="Digite a senha novamente"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-10 px-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  {error && (
                    <div className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-10 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isLoading ? "Redefinindo..." : "Redefinir senha"}
                  </button>
                </div>
                <div className="mt-4 text-center text-sm text-gray-400">
                  <Link href="/auth/login" className="text-blue-400 hover:underline font-medium">
                    Voltar para login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
