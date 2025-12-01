"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [forgotMessage, setForgotMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error

      if (data.session) {
        document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=3600`
        document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; max-age=604800`
      }

      router.push("/dashboard")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao fazer login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = () => {
    if (!email) {
      setForgotMessage("Digite seu email acima para enviarmos a simulação.")
      return
    }

    // Simulação de envio de email
    setForgotMessage(
      `Um email foi enviado para ${email} com as instruções para redefinir sua senha (simulação).`
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-black">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <img
              src="/logo.png"
              alt="Logo do App"
              className="w-16 h-16 mx-auto mb-2 rounded-2xl"
            />

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

                {error && (
                  <div className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    {error}
                  </div>
                )}

                {forgotMessage && (
                  <div className="text-sm text-blue-400 bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                    {forgotMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </button>

                <Link
                  href="/auth/forgot-password"
                  className="w-full text-sm text-blue-400 hover:underline mt-2 block text-center"
                >
                  Esqueci minha senha
                </Link>

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
