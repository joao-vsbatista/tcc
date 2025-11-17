"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { WalletIcon, CalculatorIcon, CompareIcon, ChartIcon, HistoryIcon } from "@/components/icons"

export function QuickActions() {
  const actions = [
    {
      title: "Carteira",
      description: "Seus saldos",
      icon: WalletIcon,
      href: "/dashboard/wallet",
      color: "text-yellow-400",
      bgColor: "from-yellow-500/20 to-yellow-600/20",
    },
    {
      title: "Calculadora",
      description: "Multi-moeda",
      icon: CalculatorIcon,
      href: "/dashboard/calculator",
      color: "text-blue-400",
      bgColor: "from-blue-500/20 to-blue-600/20",
    },
    {
      title: "Comparar",
      description: "Taxas",
      icon: CompareIcon,
      href: "/dashboard/compare",
      color: "text-purple-400",
      bgColor: "from-purple-500/20 to-purple-600/20",
    },
    {
      title: "Gráficos",
      description: "Tendências",
      icon: ChartIcon,
      href: "/dashboard/charts",
      color: "text-green-400",
      bgColor: "from-green-500/20 to-green-600/20",
    },
    {
      title: "Histórico",
      description: "Conversões",
      icon: HistoryIcon,
      href: "/dashboard/history",
      color: "text-orange-400",
      bgColor: "from-orange-500/20 to-orange-600/20",
    },
  ]

  return (
    <Card className="shadow-lg border border-gray-800 bg-gray-900 backdrop-blur-sm">
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.href}
                variant="outline"
                className="h-auto flex-col items-start p-4 bg-gray-800 hover:bg-gray-700 border-gray-700 transition-all"
                asChild
              >
                <Link href={action.href}>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.bgColor} flex items-center justify-center mb-2`}>
                    <Icon className={`w-5 h-5 ${action.color}`} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm text-white">{action.title}</p>
                    <p className="text-xs text-gray-400">{action.description}</p>
                  </div>
                </Link>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
