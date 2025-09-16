"use client"

import { AdminGuard } from '@/components/auth/admin-guard'
import { AdminHeader } from '@/components/admin/admin-header'
import { AdminLogs } from '@/components/admin/admin-logs'
import { useAuth } from '@/contexts/auth-context'
import { useEffect } from 'react'

export default function LogsPage() {
  const { logAdminAction } = useAuth()

  useEffect(() => {
    // Registrar acceso a logs
    logAdminAction('view_logs', 'Accedió a la página de logs de administradores')
  }, [logAdminAction])

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="container mx-auto py-8">
          <AdminLogs />
        </div>
      </div>
    </AdminGuard>
  )
}
