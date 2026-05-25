import type { Metadata } from 'next'
import { AdminGuard } from "@/components/auth/admin-guard"
import { AdminShell } from "@/components/admin/admin-shell"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Panel Admin',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminShell>{children}</AdminShell>
    </AdminGuard>
  )
}
