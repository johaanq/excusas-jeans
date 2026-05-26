"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut, Menu, ChevronRight } from "lucide-react"
import { useAdminPath } from "@/hooks/use-admin-path"
import { toInternalAdminPath } from "@/lib/admin-host"

interface AdminNavbarProps {
  title: string
  description?: string
  onMenuClick: () => void
}

type Crumb = { href?: string; label: string }

function getBreadcrumbTrail(internalPath: string): Crumb[] {
  if (internalPath === "/admin") return []
  if (internalPath === "/admin/pedidos") return [{ label: "Pedidos" }]
  if (internalPath === "/admin/products") return [{ label: "Productos" }]
  if (internalPath === "/admin/administradores") return [{ label: "Administradores" }]
  if (internalPath === "/admin/logs") return [{ label: "Actividad" }]
  if (internalPath.startsWith("/admin/edit/")) {
    return [
      { label: "Productos", href: "/products" },
      { label: "Editar producto" },
    ]
  }
  return []
}

export function AdminNavbar({ title, description, onMenuClick }: AdminNavbarProps) {
  const pathname = usePathname()
  const { adminPath } = useAdminPath()
  const { logout, adminUser } = useAuth()

  const internal = toInternalAdminPath(pathname)
  const trail = getBreadcrumbTrail(internal)
  const showBreadcrumb = trail.length > 0

  const initials = adminUser?.nombre
    ? adminUser.nombre
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AD"

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-slate-200 bg-white shadow-[0_1px_0_rgba(0,0,0,0.03)]">
      <div className="flex min-h-[56px] items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            {showBreadcrumb && (
              <nav
                className="mb-1 flex flex-wrap items-center gap-1 text-xs text-slate-500"
                aria-label="Ubicación"
              >
                <Link href={adminPath("/")} className="transition-colors hover:text-slate-800">
                  Admin
                </Link>
                {trail.map((crumb, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <ChevronRight className="h-3 w-3 shrink-0 text-slate-300" aria-hidden />
                    {crumb.href ? (
                      <Link
                        href={adminPath(crumb.href)}
                        className="transition-colors hover:text-slate-800"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-slate-600">{crumb.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            )}

            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
              <h1 className="truncate text-lg font-semibold tracking-tight text-slate-900">
                {title}
              </h1>
              {description && (
                <>
                  <span className="hidden text-slate-300 sm:inline" aria-hidden>
                    ·
                  </span>
                  <p className="truncate text-sm text-slate-500">{description}</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 border-l border-slate-100 pl-3 sm:gap-3 sm:pl-4">
          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
              {initials}
            </div>
            <div className="hidden min-w-0 max-w-[120px] md:block">
              <p className="truncate text-xs font-medium text-slate-900">
                {adminUser?.nombre ?? "Administrador"}
              </p>
              <p className="truncate text-[10px] text-slate-500">
                @{adminUser?.username ?? "admin"}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="h-9 gap-1.5 border-slate-200 px-3 text-slate-700 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden text-xs font-medium sm:inline">Salir</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
