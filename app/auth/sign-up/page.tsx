"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("As senhas não coincidem")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      })
      if (error) throw error

      if (data.session) {
        document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=3600`
        document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; max-age=604800`
        router.push("/dashboard")
      } else {
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (loginError) throw loginError

        if (loginData.session) {
          document.cookie = `sb-access-token=${loginData.session.access_token}; path=/; max-age=3600`
          document.cookie = `sb-refresh-token=${loginData.session.refresh_token}; path=/; max-age=604800`
        }

        router.push("/dashboard")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao criar conta")
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
            <h1 className="text-2xl font-bold text-white">Criar conta</h1>
            <p className="text-sm text-gray-400">Comece a usar o conversor gratuitamente</p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">Cadastro</h2>
              <p className="text-sm text-gray-400">Preencha os dados abaixo</p>
            </div>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <label htmlFor="displayName" className="text-sm font-medium text-gray-300">
                    Nome
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    placeholder="Seu nome"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="h-10 px-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none"
                  />
                </div>
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
                  <label htmlFor="password" className="text-sm font-medium text-gray-300">
                    Senha
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 px-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="repeat-password" className="text-sm font-medium text-gray-300">
                    Confirmar Senha
                  </label>
                  <input
                    id="repeat-password"
                    type="password"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
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
                  {isLoading ? "Criando conta..." : "Criar conta"}
                </button>
              </div>
              <div className="mt-4 text-center text-sm text-gray-400">
                Já tem uma conta?{" "}
                <Link href="/auth/login" className="text-blue-400 hover:underline font-medium">
                  Fazer login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
