import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OnboardingFlow } from "@/components/onboarding-flow"

export default async function OnboardingPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <OnboardingFlow userId={user.id} profile={profile} />
    </div>
  )
}
