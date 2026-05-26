"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Users,
  FileText,
  ShoppingCart,
  ExternalLink,
  X,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAdminPath } from "@/hooks/use-admin-path"
import { toInternalAdminPath } from "@/lib/admin-host"
import type { LucideIcon } from "lucide-react"

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  exact?: boolean
}

type NavGroup = {
  title: string
  items: NavItem[]
}

interface AdminSidebarProps {
  open: boolean
  onClose: () => void
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const { adminPath } = useAdminPath()

  const navGroups: NavGroup[] = [
    {
      title: "Principal",
      items: [
        { href: adminPath("/"), label: "Dashboard", icon: LayoutDashboard, exact: true },
        { href: adminPath("/pedidos"), label: "Pedidos", icon: ShoppingCart },
      ],
    },
    {
      title: "Catálogo",
      items: [{ href: adminPath("/products"), label: "Productos", icon: Package }],
    },
    {
      title: "Sistema",
      items: [
        { href: adminPath("/administradores"), label: "Administradores", icon: Users },
        { href: adminPath("/logs"), label: "Actividad", icon: FileText },
      ],
    },
  ]

  const isActive = (href: string, exact?: boolean) => {
    const current = toInternalAdminPath(pathname)
    const target = toInternalAdminPath(href)
    if (exact) return current === target
    return current === target || current.startsWith(`${target}/`)
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-out lg:static lg:z-auto lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-100 px-4">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
            <Image
              src="/logo-excusas.png"
              alt="Excusas Jeans"
              width={36}
              height={36}
              className="object-contain p-0.5"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold tracking-tight text-slate-900">
              Excusas Jeans
            </p>
            <p className="truncate text-[11px] text-slate-500">Panel de administración</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navGroups.map((group) => (
            <div key={group.title} className="mb-6 last:mb-0">
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                {group.title}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href, item.exact)
                  const Icon = item.icon
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                          active
                            ? "bg-slate-900 text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-[18px] w-[18px] shrink-0",
                            active ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                          )}
                          strokeWidth={active ? 2.25 : 1.75}
                        />
                        <span className="flex-1">{item.label}</span>
                        {active && (
                          <ChevronRight className="h-3.5 w-3.5 opacity-60" aria-hidden />
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-slate-100 p-3">
          <Link
            href="/"
            onClick={onClose}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <ExternalLink className="h-[18px] w-[18px] text-slate-400" strokeWidth={1.75} />
            Ver tienda en línea
          </Link>
        </div>
      </aside>
    </>
  )
}
