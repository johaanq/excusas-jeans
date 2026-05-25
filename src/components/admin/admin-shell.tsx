"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { AdminSidebar } from "./admin-sidebar"
import { AdminNavbar } from "./admin-navbar"

const PAGE_META: Record<string, { title: string; description?: string }> = {
  "/admin": {
    title: "Dashboard",
    description: "Resumen general de tu tienda",
  },
  "/admin/products": {
    title: "Productos",
    description: "Catálogo y estados de publicación",
  },
  "/admin/create": {
    title: "Nuevo producto",
    description: "Agregar artículo al catálogo",
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
  if (pathname.startsWith("/admin/edit/")) {
    return { title: "Editar producto", description: "Actualizar datos del catálogo" }
  }
  return PAGE_META[pathname] ?? { title: "Administración", description: "Excusas Jeans" }
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const meta = getPageMeta(pathname)

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col lg:pl-0">
        <AdminNavbar
          title={meta.title}
          description={meta.description}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
