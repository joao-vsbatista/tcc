"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { WalletIcon, ChartIcon, HistoryIcon, CurrencyIcon } from "@/components/icons"

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
      name: "Simular",
      href: "/dashboard/simulator",
      icon: () => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <path d="M8 12h8M12 8v8" strokeWidth="2" />
        </svg>
      ),
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
