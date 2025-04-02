import HospitalDashboard from "@/components/hospital-dashboard"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Hospital Dashboard | HealSync",
  description: "Manage organ donations, transplants, and patient information",
}

export default function HospitalDashboardPage() {
  return <HospitalDashboard />
} 