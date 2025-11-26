"use client"

import { useState } from "react"
import { AddBalanceModal } from "@/components/add-balance-modal"
import { ConvertModal } from "@/components/convert-modal"
import { SendBalanceModal } from "@/components/send-balance-modal"
import { ReceiveBalanceModal } from "@/components/receive-balance-modal"
import { AddMoneyIcon, ConvertIcon, SendIcon, ReceiveIcon } from "@/components/icons"

interface MainActionsProps {
  userId: string
  profile: any
}

export function MainActions({ userId, profile }: MainActionsProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [showReceiveModal, setShowReceiveModal] = useState(false)

  const actions = [
    {
      name: "Adicionar",
      description: "Via PIX ou Boleto",
      icon: AddMoneyIcon,
      gradient: "from-green-500 to-emerald-600",
      onClick: () => setShowAddModal(true),
    },
    {
      name: "Converter",
      description: "Entre moedas",
      icon: ConvertIcon,
      gradient: "from-blue-500 to-purple-600",
      onClick: () => setShowConvertModal(true),
    },
    {
      name: "Enviar",
      description: "Via PIX",
      icon: SendIcon,
      gradient: "from-orange-500 to-red-600",
      onClick: () => setShowSendModal(true),
    },
    {
      name: "Receber",
      description: "Via PIX",
      icon: ReceiveIcon,
      gradient: "from-cyan-500 to-blue-600",
      onClick: () => setShowReceiveModal(true),
    },
  ]

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action) => {
          const IconComponent = action.icon
          return (
            <button
              key={action.name}
              onClick={action.onClick}
              className="group bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-2xl p-6 transition-all hover:scale-105 hover:border-gray-700"
            >
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform`}
              >
                <IconComponent className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-1">{action.name}</h3>
              <p className="text-gray-400 text-sm">{action.description}</p>
            </button>
          )
        })}
      </div>

      {showAddModal && <AddBalanceModal userId={userId} onClose={() => setShowAddModal(false)} />}
      {showConvertModal && (
        <ConvertModal userId={userId} profile={profile} onClose={() => setShowConvertModal(false)} />
      )}
      {showSendModal && <SendBalanceModal userId={userId} onClose={() => setShowSendModal(false)} />}
      {showReceiveModal && <ReceiveBalanceModal userId={userId} onClose={() => setShowReceiveModal(false)} />}
    </>
  )
}
