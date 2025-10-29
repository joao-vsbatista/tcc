import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SettingsForm } from "@/components/settings-form"
import Link from "next/link"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-black">
      <div className="container max-w-md mx-auto px-4 py-8">
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
          <h1 className="text-3xl font-bold text-white mb-2">Configurações</h1>
          <p className="text-gray-400">Personalize sua experiência</p>
        </div>

        <SettingsForm user={user} profile={profile} />
      </div>
    </div>
  )
}
