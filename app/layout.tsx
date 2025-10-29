import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Conversor de Moedas - Taxas em Tempo Real",
  description: "Converta moedas com taxas de câmbio atualizadas em tempo real. PWA instalável.",
  manifest: "/manifest.json",
  themeColor: "#000000",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/icon-192.jpg" />
        <link rel="apple-touch-icon" href="/icon-192.jpg" />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
