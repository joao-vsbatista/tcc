"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"

interface AddBalanceModalProps {
  userId: string
  onClose: () => void
}

export function AddBalanceModal({ userId, onClose }: AddBalanceModalProps) {
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState<"pix" | "boleto">("pix")
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const handleAdd = async () => {
    if (!amount || Number(amount) <= 0) return

    setLoading(true)
    try {

      const { data: wallet } = await supabase
        .from("wallet")
        .select("balance")
        .eq("user_id", userId)
        .eq("currency", "BRL")
        .single()

      const currentBalance = wallet?.balance || 0
      const newBalance = currentBalance + Number(amount)


      const { error } = await supabase.from("wallet").upsert({
        user_id: userId,
        currency: "BRL",
        balance: newBalance,
      })

      if (!error) {

        await supabase.from("wallet_transactions").insert({
          user_id: userId,
          type: "deposit",
          currency: "BRL",
          amount: Number(amount),
          method: method,
        })

        window.location.reload()
      }
    } catch (error) {
      console.error("Error adding balance:", error)
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
        <h2 className="text-2xl font-bold text-white mb-6">Adicionar Saldo</h2>

        <div className="space-y-4">
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

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Método</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMethod("pix")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  method === "pix"
                    ? "border-blue-500 bg-blue-500/10 text-white"
                    : "border-gray-700 bg-gray-800 text-gray-400"
                }`}
              >
                <div className="text-2xl mb-2"></div>
                <div className="font-semibold">PIX</div>
              </button>
              <button
                onClick={() => setMethod("boleto")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  method === "boleto"
                    ? "border-blue-500 bg-blue-500/10 text-white"
                    : "border-gray-700 bg-gray-800 text-gray-400"
                }`}
              >
                <div className="text-2xl mb-2"></div>
                <div className="font-semibold">Boleto</div>
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-400 font-semibold hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleAdd}
              disabled={loading || !amount || Number(amount) <= 0}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition-all"
            >
              {loading ? "Processando..." : "Adicionar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
