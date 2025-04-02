import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#96D7C6]/10 to-white p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#6C8CBF] mb-4">Unauthorized Access</h1>
        <p className="text-gray-600 mb-8">
          You don't have permission to access this page.
        </p>
        <Link href="/">
          <Button className="bg-[#5AA7A7] hover:bg-[#4A9696] text-white">
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  )
} 