"use client"

import { useState, useEffect } from "react"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500 text-white shadow-lg">
        <span className="text-lg">📡</span>
        <span className="text-sm font-medium">Modo Offline</span>
      </div>
    </div>
  )
}
