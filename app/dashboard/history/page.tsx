import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { HistoryList } from "@/components/history-list"
import { HistoryStats } from "@/components/history-stats"
import Link from "next/link"

export default async function HistoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: conversions } = await supabase
    .from("conversion_history")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-black">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
          >
            <span>←</span>
            <span>Voltar</span>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Histórico de Conversões</h1>
          <p className="text-gray-400">Análise completa das suas conversões</p>
        </div>

        <HistoryStats conversions={conversions || []} />
        <HistoryList conversions={conversions || []} userId={user.id} />
      </div>
    </div>
  )
}
