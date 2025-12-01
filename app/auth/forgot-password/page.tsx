"use client"

import { useState } from "react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()

    // SIMULAÇÃO de envio de email
    setTimeout(() => {
      setSent(true)
    }, 1000)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-6">
      <div className="w-full max-w-sm bg-gray-900 p-6 rounded-2xl border border-gray-800">
        {!sent ? (
          <>
            <h1 className="text-2xl font-bold text-white mb-2">Recuperar senha</h1>
            <p className="text-sm text-gray-400 mb-6">
              Digite seu email para receber o link de redefinição.
            </p>

            <form onSubmit={handleSend} className="flex flex-col gap-4">
              <div className="grid gap-2">
                <label className="text-sm text-gray-300">Email</label>
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 px-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="h-10 w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:opacity-90"
              >
                Enviar link
              </button>
            </form>

            <Link
              href="/auth/login"
              className="block mt-4 text-center text-sm text-gray-400 hover:text-gray-200"
            >
              ← Voltar ao login
            </Link>
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-2">Email enviado!</h2>
            <p className="text-gray-400 text-sm mb-6">
              Se o email existir no sistema, você receberá um link para redefinir sua senha.
            </p>

            <Link
              href="/auth/login"
              className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-500 transition-colors"
            >
              Voltar ao login
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
