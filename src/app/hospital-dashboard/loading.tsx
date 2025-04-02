export default function HospitalDashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#96D7C6]/10 to-white flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#5AA7A7] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#6C8CBF] font-medium">Loading dashboard...</p>
      </div>
    </div>
  )
} 