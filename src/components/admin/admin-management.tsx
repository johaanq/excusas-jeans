"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { adminQuery } from "@/lib/admin-api"
import { useToast } from "@/components/ui/toast"
import { UserPlus, Eye, EyeOff, Users, RefreshCw } from "lucide-react"

interface AdminFormData {
  username: string
  password: string
  nombre: string
  email: string
}

interface AdminRow {
  id: string
  username: string
  nombre: string
  email: string | null
  activo: boolean
  created_at: string
}

export function AdminManagement() {
  const { logAdminAction, getAdminCredentials } = useAuth()
  const { success, error: showError, ToastContainer } = useToast()
  const [admins, setAdmins] = useState<AdminRow[]>([])
  const [loadingAdmins, setLoadingAdmins] = useState(true)
  const [formData, setFormData] = useState<AdminFormData>({
    username: "",
    password: "",
    nombre: "",
    email: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const loadAdmins = useCallback(async () => {
    setLoadingAdmins(true)
    try {
      const rows = await adminQuery<AdminRow[]>({
        op: "select",
        table: "administradores",
        select: "id, username, nombre, email, activo, created_at",
        order: { column: "created_at", ascending: true },
      })
      setAdmins(rows ?? [])
    } catch (err) {
      console.error("Error loading admins:", err)
      showError("Error", "No se pudo cargar la lista de administradores")
    } finally {
      setLoadingAdmins(false)
    }
  }, [showError])

  useEffect(() => {
    loadAdmins()
  }, [loadAdmins])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const creds = getAdminCredentials()
      if (!creds) {
        showError("Sesión expirada", "Vuelve a iniciar sesión para crear administradores.")
        return
      }

      const data = await adminQuery<string>({
        table: "administradores",
        op: "rpc",
        rpc: "crear_admin",
        rpcArgs: {
          p_username: formData.username,
          p_password: formData.password,
          p_nombre: formData.nombre,
          p_email: formData.email || null,
          p_creator_username: creds.username,
          p_creator_password: creds.password,
        },
      })

      success("Administrador creado", `"${formData.nombre}" (@${formData.username})`)

      await logAdminAction(
        "create_admin",
        `Creó nuevo administrador: ${formData.nombre} (@${formData.username})`,
        "admin",
        typeof data === "string" ? data : undefined,
        { username: formData.username, email: formData.email }
      )

      setFormData({ username: "", password: "", nombre: "", email: "" })
      await loadAdmins()
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo crear el administrador."
      showError("Error al crear administrador", message)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es-PE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Card className="border-slate-200/90 p-0 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-600" />
            <div>
              <h2 className="text-base font-semibold text-slate-900">Administradores</h2>
              <p className="text-xs text-slate-500">
                {admins.length === 1
                  ? "1 cuenta registrada"
                  : `${admins.length} cuentas registradas`}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadAdmins}
            disabled={loadingAdmins}
            className="gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${loadingAdmins ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>

        {loadingAdmins ? (
          <div className="py-12">
            <LoadingSpinner />
          </div>
        ) : admins.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-500">No hay administradores en el sistema.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3 font-medium">Usuario</th>
                  <th className="px-5 py-3 font-medium">Nombre</th>
                  <th className="px-5 py-3 font-medium">Correo</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 font-medium">Alta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3 font-medium text-slate-900">@{admin.username}</td>
                    <td className="px-5 py-3 text-slate-700">{admin.nombre}</td>
                    <td className="px-5 py-3 text-slate-600">{admin.email || "—"}</td>
                    <td className="px-5 py-3">
                      <Badge variant={admin.activo ? "default" : "secondary"}>
                        {admin.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                      {formatDate(admin.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="border-slate-200/90 p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-slate-600" />
          <h2 className="text-base font-semibold text-slate-900">Nuevo administrador</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                placeholder="admin2"
                required
              />
            </div>
            <div>
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input
                id="nombre"
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                placeholder="Juan Pérez"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Correo (opcional)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="admin@excusasjeans.com"
            />
          </div>

          <div>
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Contraseña segura"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? "Creando…" : "Crear administrador"}
          </Button>
        </form>
      </Card>

      <ToastContainer />
    </div>
  )
}
