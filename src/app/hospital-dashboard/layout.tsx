import ProtectedRoute from "@/components/ProtectedRoute"

export default function HospitalDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={["hospital"]}>
      {children}
    </ProtectedRoute>
  )
} 