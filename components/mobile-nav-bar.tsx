"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { WalletIcon, ChartIcon, HistoryIcon, CurrencyIcon, SettingsIcon } from "@/components/icons"

export function MobileNavBar() {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Início",
      href: "/dashboard",
      icon: CurrencyIcon,
    },
    {
      name: "Carteira",
      href: "/dashboard/wallet",
      icon: WalletIcon,
    },
    {
      name: "Gráficos",
      href: "/dashboard/charts",
      icon: ChartIcon,
    },
    {
      name: "Histórico",
      href: "/dashboard/history",
      icon: HistoryIcon,
    },
    {
      name: "Config",
      href: "/dashboard/settings",
      icon: SettingsIcon,
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50 md:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? "text-blue-400" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
