import AuthPage from "@/components/auth-page"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentication | HealSync",
  description: "Login or register to access the HealSync organ donation platform",
}

export default function Auth() {
  return <AuthPage />
}
