"use client"

import { useMemo } from "react"
import { getAdminPath, isAdminHost } from "@/lib/admin-host"

/** Rutas del panel según host actual (subdominio o /admin en local). */
export function useAdminPath() {
  const host = typeof window !== "undefined" ? window.location.host : null

  return useMemo(
    () => ({
      host,
      isAdminSubdomain: host ? isAdminHost(host) : false,
      adminPath: (subpath = "") => getAdminPath(subpath, host),
    }),
    [host]
  )
}
