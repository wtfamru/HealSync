"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth");
      } else if (!allowedRoles.includes(userRole!)) {
        router.push("/unauthorized");
      }
    }
  }, [user, userRole, loading, router, allowedRoles]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !allowedRoles.includes(userRole!)) {
    return null;
  }

  return <>{children}</>;
} 