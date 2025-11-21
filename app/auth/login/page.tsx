"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Attempting login with email:", email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("[v0] Login response:", { data, error })

      if (error) throw error

      console.log("[v0] Login successful, redirecting to dashboard")
      router.push("/dashboard")
      router.refresh()
    } catch (error: unknown) {
      console.error("[v0] Login error:", error)
      setError(error instanceof Error ? error.message : "Erro ao fazer login")
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
              <span className="text-4xl">💱</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Bem-vindo de volta</h1>
            <p className="text-sm text-gray-400">Entre na sua conta para continuar</p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">Login</h2>
              <p className="text-sm text-gray-400">Digite seu email e senha</p>
            </div>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 px-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium text-gray-300">
                      Senha
                    </label>
                    <Link 
                      href="/auth/forgot-password" 
                      className="text-xs text-blue-400 hover:underline"
                    >
                      Esqueci minha senha
                    </Link>
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                  {isLoading ? "Entrando..." : "Entrar"}
                </button>
              </div>
              <div className="mt-4 text-center text-sm text-gray-400">
                Não tem uma conta?{" "}
                <Link href="/auth/sign-up" className="text-blue-400 hover:underline font-medium">
                  Cadastre-se
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
