"use client"

import { ThirdwebProvider } from "thirdweb/react"
import { createThirdwebClient } from "thirdweb"

const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;

if (!clientId) {
  console.warn("Thirdweb Client ID (NEXT_PUBLIC_THIRDWEB_CLIENT_ID) is missing from environment variables. Please add it to your .env file. Using fallback.")
}

// The client is configured once here
export const client = createThirdwebClient({
  clientId: clientId || "MISSING_CLIENT_ID",
})

// The provider component uses the client configuration implicitly
export function ThirdwebProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThirdwebProvider>
      {children}
    </ThirdwebProvider>
  )
} 