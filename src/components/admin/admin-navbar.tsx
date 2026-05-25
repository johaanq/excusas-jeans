"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut, Menu, Bell } from "lucide-react"

interface AdminNavbarProps {
  title: string
  description?: string
  onMenuClick: () => void
}

export function AdminNavbar({ title, description, onMenuClick }: AdminNavbarProps) {
  const { logout, adminUser } = useAuth()

  const initials = adminUser?.nombre
    ? adminUser.nombre
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AD"

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-slate-900 sm:text-xl">{title}</h1>
            {description && (
              <p className="hidden truncate text-sm text-slate-500 sm:block">{description}</p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="hidden rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 sm:flex"
            aria-label="Notificaciones"
          >
            <Bell className="h-4 w-4" />
          </button>

          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-3 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
              {initials}
            </div>
            <div className="min-w-0 text-left">
              <p className="truncate text-xs font-semibold text-slate-900">
                {adminUser?.nombre ?? "Administrador"}
              </p>
              <p className="truncate text-[10px] text-slate-500">@{adminUser?.username ?? "admin"}</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="gap-1.5 border-slate-200"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Salir</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
