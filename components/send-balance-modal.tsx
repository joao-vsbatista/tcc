"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"

interface SendBalanceModalProps {
  userId: string
  onClose: () => void
}

export function SendBalanceModal({ userId, onClose }: SendBalanceModalProps) {
  const [amount, setAmount] = useState("")
  const [pixKey, setPixKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [balance, setBalance] = useState<number>(0)

  const supabase = createClient()

  useEffect(() => {
    loadBalance()
  }, [])

  const loadBalance = async () => {
    const { data: wallet } = await supabase
      .from("wallet")
      .select("balance")
      .eq("user_id", userId)
      .eq("currency", "BRL")
      .single()

    setBalance(wallet?.balance || 0)
  }

  const handleSend = async () => {
    if (!amount || Number(amount) <= 0 || !pixKey) return

    if (balance < Number(amount)) {
      alert("Saldo insuficiente")
      return
    }

    setLoading(true)
    try {
      const newBalance = balance - Number(amount)

      await supabase.from("wallet").update({ balance: newBalance }).eq("user_id", userId).eq("currency", "BRL")

      await supabase.from("wallet_transactions").insert({
        user_id: userId,
        type: "send",
        currency: "BRL",
        amount: Number(amount),
        method: "pix",
        pix_key: pixKey,
      })

      window.location.reload()
    } catch (error) {
      console.error("Error sending balance:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-6">Enviar via PIX</h2>

        <div className="space-y-4">
          <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
            <p className="text-xs text-blue-400">Saldo disponível</p>
            <p className="text-lg font-bold text-white">
              R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Chave PIX</label>
            <Input
              type="text"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder="email@example.com"
              className="h-12 bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Valor (BRL)</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="text-2xl h-14 bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-400 font-semibold hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSend}
              disabled={loading || !amount || Number(amount) <= 0 || !pixKey || balance < Number(amount)}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold hover:from-orange-600 hover:to-red-700 disabled:opacity-50 transition-all"
            >
              {loading ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
