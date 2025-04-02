import ProtectedRoute from "@/components/ProtectedRoute"

export default function DonorDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={["donor"]}>
      {children}
    </ProtectedRoute>
  )
}