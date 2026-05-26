import type { LucideIcon } from "lucide-react"
import {
  LogIn,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  UserPlus,
  UserCog,
  ClipboardList,
  Download,
  FileText,
} from "lucide-react"

export const ADMIN_ACTION_LABELS: Record<string, string> = {
  login: "Inicio de sesión",
  logout: "Cierre de sesión",
  create_producto: "Crear producto",
  update_producto: "Editar producto",
  delete_producto: "Eliminar producto",
  create_admin: "Crear administrador",
  update_admin: "Editar administrador",
  delete_admin: "Eliminar administrador",
  view_logs: "Ver actividad",
  export_data: "Exportar datos",
}

const ADMIN_ACTION_ICONS: Record<string, LucideIcon> = {
  login: LogIn,
  logout: LogOut,
  create_producto: Plus,
  update_producto: Pencil,
  delete_producto: Trash2,
  create_admin: UserPlus,
  update_admin: UserCog,
  delete_admin: Trash2,
  view_logs: ClipboardList,
  export_data: Download,
}

export function getAdminActionLabel(action: string): string {
  return (
    ADMIN_ACTION_LABELS[action] ??
    action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  )
}

export function getAdminActionIcon(action: string): LucideIcon {
  return ADMIN_ACTION_ICONS[action] ?? FileText
}

export function getAdminActionColor(action: string): string {
  switch (action) {
    case "login":
      return "text-emerald-700 bg-emerald-50"
    case "logout":
      return "text-slate-600 bg-slate-100"
    case "create_producto":
      return "text-blue-700 bg-blue-50"
    case "update_producto":
      return "text-amber-700 bg-amber-50"
    case "delete_producto":
      return "text-red-700 bg-red-50"
    case "create_admin":
    case "update_admin":
      return "text-violet-700 bg-violet-50"
    case "delete_admin":
      return "text-red-700 bg-red-50"
    case "view_logs":
      return "text-indigo-700 bg-indigo-50"
    case "export_data":
      return "text-orange-700 bg-orange-50"
    default:
      return "text-slate-600 bg-slate-100"
  }
}
