"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const currencies = [
  { code: "USD", name: "Dólar", flag: "🇺🇸" },
  { code: "BRL", name: "Real", flag: "🇧🇷" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", name: "Libra", flag: "🇬🇧" },
  { code: "JPY", name: "Iene", flag: "🇯🇵" },
  { code: "CAD", name: "Dólar Canadense", flag: "🇨🇦" },
  { code: "AUD", name: "Dólar Australiano", flag: "🇦🇺" },
  { code: "CHF", name: "Franco Suíço", flag: "🇨🇭" },
  { code: "CNY", name: "Yuan", flag: "🇨🇳" },
  { code: "ARS", name: "Peso Argentino", flag: "🇦🇷" },
]

interface CurrencySelectProps {
  value: string
  onChange: (value: string) => void
}

export function CurrencySelect({ value, onChange }: CurrencySelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-32 h-14 text-lg font-semibold">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {currencies.map((currency) => (
          <SelectItem key={currency.code} value={currency.code} className="text-base">
            <div className="flex items-center gap-2">
              <span className="text-xl">{currency.flag}</span>
              <span>{currency.code}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
