"use client"

import { AdminGuard } from '@/components/auth/admin-guard'
import { AdminHeader } from '@/components/admin/admin-header'
import { AdminManagement } from '@/components/admin/admin-management'

export default function AdministradoresPage() {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="container mx-auto py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestión de Administradores
            </h1>
            <p className="text-gray-600">
              Crear y gestionar cuentas de administradores del sistema
            </p>
          </div>
          
          <AdminManagement />
        </div>
      </div>
    </AdminGuard>
  )
}
