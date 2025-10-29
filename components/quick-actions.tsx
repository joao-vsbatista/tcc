"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function QuickActions() {
  const actions = [
    {
      title: "Calculadora",
      description: "Multi-moeda",
      icon: "🧮",
      href: "/dashboard/calculator",
      color: "text-blue-400",
      bgColor: "bg-blue-900/30",
    },
    {
      title: "Comparar",
      description: "Taxas",
      icon: "🔄",
      href: "/dashboard/compare",
      color: "text-purple-400",
      bgColor: "bg-purple-900/30",
    },
    {
      title: "Gráficos",
      description: "Tendências",
      icon: "📈",
      href: "/dashboard/charts",
      color: "text-green-400",
      bgColor: "bg-green-900/30",
    },
    {
      title: "Histórico",
      description: "Conversões",
      icon: "🕐",
      href: "/dashboard/history",
      color: "text-orange-400",
      bgColor: "bg-orange-900/30",
    },
  ]

  return (
    <Card className="shadow-lg border border-gray-800 bg-gray-900 backdrop-blur-sm">
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.href}
              variant="outline"
              className="h-auto flex-col items-start p-4 bg-gray-800 hover:bg-gray-700 border-gray-700"
              asChild
            >
              <Link href={action.href}>
                <div className={`w-10 h-10 rounded-lg ${action.bgColor} flex items-center justify-center mb-2`}>
                  <span className="text-2xl">{action.icon}</span>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm text-white">{action.title}</p>
                  <p className="text-xs text-gray-400">{action.description}</p>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
