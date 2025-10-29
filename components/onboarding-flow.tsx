"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Star, BarChart3, Calculator, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface OnboardingFlowProps {
  userId: string
  profile: any
}

export function OnboardingFlow({ userId, profile }: OnboardingFlowProps) {
  const [step, setStep] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  const steps = [
    {
      title: "Bem-vindo ao Conversor de Moedas!",
      description: "Seu assistente completo para conversão de moedas",
      icon: TrendingUp,
      content: (
        <div className="space-y-4 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <p className="text-muted-foreground">
            Converta moedas em tempo real, acompanhe tendências e gerencie seus pares favoritos
          </p>
        </div>
      ),
    },
    {
      title: "Conversão em Tempo Real",
      description: "Taxas atualizadas instantaneamente",
      icon: TrendingUp,
      content: (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50 border-2 border-primary/20">
            <p className="text-sm text-muted-foreground mb-2">Exemplo:</p>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold">100 USD</span>
              <span className="text-muted-foreground">→</span>
              <span className="text-xl font-bold text-primary">500 BRL</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Todas as suas conversões são salvas automaticamente no histórico
          </p>
        </div>
      ),
    },
    {
      title: "Watchlist Personalizada",
      description: "Acompanhe seus pares favoritos",
      icon: Star,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
              <span className="font-semibold">USD/BRL</span>
              <span className="text-primary font-bold">5.0234</span>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
              <span className="font-semibold">EUR/USD</span>
              <span className="text-primary font-bold">1.0856</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Configure alertas de preço e receba notificações quando atingir sua meta
          </p>
        </div>
      ),
    },
    {
      title: "Análise e Gráficos",
      description: "Visualize tendências ao longo do tempo",
      icon: BarChart3,
      content: (
        <div className="space-y-4">
          <div className="h-32 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-end justify-around p-4">
            <div className="w-8 bg-blue-500 rounded-t" style={{ height: "40%" }} />
            <div className="w-8 bg-blue-500 rounded-t" style={{ height: "60%" }} />
            <div className="w-8 bg-blue-500 rounded-t" style={{ height: "80%" }} />
            <div className="w-8 bg-blue-500 rounded-t" style={{ height: "70%" }} />
            <div className="w-8 bg-blue-500 rounded-t" style={{ height: "90%" }} />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Acompanhe a variação das taxas em períodos de 7, 30 ou 90 dias
          </p>
        </div>
      ),
    },
    {
      title: "Calculadora Multi-Moeda",
      description: "Compare várias moedas simultaneamente",
      icon: Calculator,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground mb-1">BRL</p>
              <p className="text-lg font-bold">500.00</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground mb-1">EUR</p>
              <p className="text-lg font-bold">85.00</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground mb-1">GBP</p>
              <p className="text-lg font-bold">73.00</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground mb-1">JPY</p>
              <p className="text-lg font-bold">11000</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Converta um valor para múltiplas moedas de uma só vez
          </p>
        </div>
      ),
    },
    {
      title: "Tudo Pronto!",
      description: "Comece a usar agora",
      icon: CheckCircle2,
      content: (
        <div className="space-y-4 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-muted-foreground">
            Você está pronto para começar! Explore todas as funcionalidades e aproveite o app.
          </p>
        </div>
      ),
    },
  ]

  const currentStep = steps[step]
  const progress = ((step + 1) / steps.length) * 100

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      // Mark onboarding as complete
      await supabase.from("profiles").update({ updated_at: new Date().toISOString() }).eq("id", userId)

      router.push("/dashboard")
    }
  }

  const handleSkip = () => {
    router.push("/dashboard")
  }

  return (
    <div className="container max-w-md mx-auto px-4 py-8 min-h-screen flex flex-col justify-center">
      <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <CardHeader>
          <div className="mb-4">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {step + 1} de {steps.length}
            </p>
          </div>
          <div className="text-center">
            <currentStep.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
            <CardTitle className="text-2xl mb-2">{currentStep.title}</CardTitle>
            <CardDescription>{currentStep.description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep.content}

          <div className="flex gap-3">
            {step < steps.length - 1 && (
              <Button variant="outline" onClick={handleSkip} className="flex-1 bg-transparent">
                Pular
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1">
              {step < steps.length - 1 ? "Próximo" : "Começar"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
