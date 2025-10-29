"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function useKeyboardShortcuts() {
  const router = useRouter()

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K - Quick search (future feature)
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        console.log("Quick search")
      }

      // Ctrl/Cmd + H - Go to history
      if ((e.ctrlKey || e.metaKey) && e.key === "h") {
        e.preventDefault()
        router.push("/dashboard/history")
      }

      // Ctrl/Cmd + W - Go to watchlist
      if ((e.ctrlKey || e.metaKey) && e.key === "w") {
        e.preventDefault()
        router.push("/dashboard/watchlist")
      }

      // Ctrl/Cmd + D - Go to dashboard
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault()
        router.push("/dashboard")
      }

      // Ctrl/Cmd + C - Go to calculator
      if ((e.ctrlKey || e.metaKey) && e.key === "c" && e.shiftKey) {
        e.preventDefault()
        router.push("/dashboard/calculator")
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [router])
}
