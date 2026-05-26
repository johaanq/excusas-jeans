"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { AdminSidebar } from "./admin-sidebar"
import { AdminNavbar } from "./admin-navbar"
import { toInternalAdminPath } from "@/lib/admin-host"

const PAGE_META: Record<string, { title: string; description?: string }> = {
  "/admin": {
    title: "Dashboard",
    description: "Ventas, pedidos y catálogo",
  },
  "/admin/pedidos": {
    title: "Pedidos",
    description: "Lima y provincia · Culqi",
  },
  "/admin/products": {
    title: "Productos",
    description: "Catálogo y estados de publicación",
  },
  "/admin/administradores": {
    title: "Administradores",
    description: "Cuentas con acceso al panel",
  },
  "/admin/logs": {
    title: "Actividad",
    description: "Historial de acciones del equipo",
  },
}

function getPageMeta(pathname: string) {
  const internal = toInternalAdminPath(pathname)
  if (internal.startsWith("/admin/edit/")) {
    return { title: "Editar producto", description: "Actualizar datos del catálogo" }
  }
  return PAGE_META[internal] ?? { title: "Administración", description: "Excusas Jeans" }
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const meta = getPageMeta(pathname)

  return (
    <div className="flex min-h-screen bg-[#f4f4f5]">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AdminNavbar
          title={meta.title}
          description={meta.description}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1400px] p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
