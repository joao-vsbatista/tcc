"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)

      const dismissed = localStorage.getItem("pwa-install-dismissed")
      if (!dismissed) {
        setShowPrompt(true)
      }
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      console.log("PWA installed")
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem("pwa-install-dismissed", "true")
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
        <CardContent className="pt-6 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 text-white hover:bg-white/20"
            onClick={handleDismiss}
          >
            <span className="text-lg">✕</span>
          </Button>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">📥</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Instalar App</h3>
              <p className="text-sm text-blue-50 mb-4">
                Instale o app na sua tela inicial para acesso rápido e uso offline
              </p>
              <Button onClick={handleInstall} variant="secondary" size="sm" className="w-full">
                Instalar Agora
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
