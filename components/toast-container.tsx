"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface Toast {
  id: string
  title: string
  description?: string
  variant?: "default" | "success" | "error"
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const handleToast = (event: CustomEvent<Toast>) => {
      const toast = event.detail
      setToasts((prev) => [...prev, toast])

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id))
      }, 3000)
    }

    window.addEventListener("show-toast" as any, handleToast)
    return () => window.removeEventListener("show-toast" as any, handleToast)
  }, [])

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-lg shadow-lg backdrop-blur-sm animate-in slide-in-from-right ${
            toast.variant === "success"
              ? "bg-green-100 dark:bg-green-900/80 text-green-900 dark:text-green-100"
              : toast.variant === "error"
                ? "bg-red-100 dark:bg-red-900/80 text-red-900 dark:text-red-100"
                : "bg-white dark:bg-gray-900 text-foreground"
          }`}
        >
          <div className="flex items-start gap-3">
            {toast.variant === "success" && <span className="text-xl">✓</span>}
            {toast.variant === "error" && <span className="text-xl">✕</span>}
            <div className="flex-1">
              <p className="font-semibold text-sm">{toast.title}</p>
              {toast.description && <p className="text-xs mt-1 opacity-90">{toast.description}</p>}
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => dismiss(toast.id)}>
              <span className="text-sm">✕</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
