"use client"

import { Button } from "@/components/ui/button"
import { useEffect } from "react"

export default function HospitalDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#96D7C6]/10 to-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#6C8CBF]">Something went wrong!</h2>
        <p className="text-gray-600">We apologize for the inconvenience.</p>
        <Button
          onClick={reset}
          className="bg-[#5AA7A7] hover:bg-[#4A9696] text-white"
        >
          Try again
        </Button>
      </div>
    </div>
  )
} 