"use client"

import { AdminLogs } from "@/components/admin/admin-logs"
import { useAuth } from "@/contexts/auth-context"
import { useEffect } from "react"

export default function LogsPage() {
  const { logAdminAction } = useAuth()

  useEffect(() => {
    logAdminAction("view_logs", "Accedió a la página de logs de administradores")
  }, [logAdminAction])

  return <AdminLogs />
}
