import { AdminGuard } from '@/components/auth/admin-guard'
import { AdminDashboard } from '@/components/admin/admin-dashboard'

export default function AdminPage() {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto pt-20 sm:pt-24 md:pt-28 pb-8">
          <AdminDashboard />
        </div>
      </div>
    </AdminGuard>
  )
}
