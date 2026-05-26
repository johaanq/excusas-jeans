"use client"

import { Badge } from "@/components/ui/badge"
import {
  getAdminActionColor,
  getAdminActionIcon,
  getAdminActionLabel,
} from "@/lib/admin-actions"

export function AdminActionBadge({ action }: { action: string }) {
  const Icon = getAdminActionIcon(action)
  const label = getAdminActionLabel(action)

  return (
    <Badge className={`inline-flex items-center gap-1 border-0 font-normal ${getAdminActionColor(action)}`}>
      <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
      {label}
    </Badge>
  )
}
