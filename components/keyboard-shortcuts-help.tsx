"use client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Keyboard } from "lucide-react"

export function KeyboardShortcutsHelp() {
  const shortcuts = [
    { keys: ["Ctrl", "D"], description: "Ir para Dashboard" },
    { keys: ["Ctrl", "H"], description: "Ir para Histórico" },
    { keys: ["Ctrl", "W"], description: "Ir para Watchlist" },
    { keys: ["Ctrl", "Shift", "C"], description: "Ir para Calculadora" },
  ]

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed bottom-4 right-4 rounded-full shadow-lg">
          <Keyboard className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atalhos de Teclado</DialogTitle>
          <DialogDescription>Navegue mais rápido com atalhos</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span className="text-sm">{shortcut.description}</span>
              <div className="flex gap-1">
                {shortcut.keys.map((key, i) => (
                  <kbd key={i} className="px-2 py-1 text-xs font-semibold rounded bg-background border shadow-sm">
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
