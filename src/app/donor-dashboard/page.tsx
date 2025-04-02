import DonorDashboard from "@/components/donor-dashboard"
import { Metadata } from "next"
import { Heart } from "lucide-react"

export const metadata: Metadata = {
  title: "Donor Dashboard | HealSync",
  description: "Manage your organ donation preferences and information",
}

export default function DonorDashboardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#96D7C6]/10 to-white">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-[#6C8CBF]" />
            <h1 className="text-xl font-bold text-[#6C8CBF] hover:text-[#5AA7A7] transition-colors select-none">HealSync</h1>
          </div>
          <p className="text-gray-600">Manage your organ donation preferences and information</p>
        </div>
        <DonorDashboard />
      </div>
    </main>
  )
} 