"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface ReceiveBalanceModalProps {
  userId: string
  onClose: () => void
}

export function ReceiveBalanceModal({ userId, onClose }: ReceiveBalanceModalProps) {
  const [pixKey, setPixKey] = useState("")
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadPixKey()
  }, [])

  const loadPixKey = async () => {
    try {
      const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", userId).single()

      // Gera chave PIX fictícia baseada no user ID
      setPixKey(`${profile?.display_name?.toLowerCase().replace(/\s/g, "")}@wallet.app`)
    } catch (error) {
      console.error("Error loading PIX key:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyPixKey = () => {
    navigator.clipboard.writeText(pixKey)
    alert("Chave PIX copiada!")
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-6">Receber via PIX</h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl">
              <div className="w-48 h-48 bg-gray-200 mx-auto rounded-lg flex items-center justify-center">
                <span className="text-4xl">📱</span>
              </div>
              <p className="text-center text-gray-600 text-sm mt-4">QR Code PIX</p>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Sua Chave PIX</label>
              <div className="flex gap-2">
                <div className="flex-1 h-12 rounded-lg border border-gray-700 bg-gray-800 px-4 flex items-center">
                  <span className="text-white truncate">{pixKey}</span>
                </div>
                <button
                  onClick={copyPixKey}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                >
                  Copiar
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl border border-gray-700 text-gray-400 font-semibold hover:bg-gray-800 transition-colors"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
