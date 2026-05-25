"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { DonutKpi } from "@/components/admin/donut-kpi"
import { Plus, Package, Edit, ShoppingCart, ImageIcon, Activity } from "lucide-react"
import { adminQuery } from "@/lib/admin-api"
import Link from "next/link"

interface Stats {
  totalProductos: number
  productosActivos: number
  productosInactivos: number
  productosConFoto: number
  productosSinFoto: number
  totalUsuarios: number
  usuariosConCarrito: number
  totalItemsCarrito: number
  logsHoy: number
}

interface RecentProduct {
  id: string
  nombre: string
  estado: string
  precio?: number
  created_at: string
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProductos: 0,
    productosActivos: 0,
    productosInactivos: 0,
    productosConFoto: 0,
    productosSinFoto: 0,
    totalUsuarios: 0,
    usuariosConCarrito: 0,
    totalItemsCarrito: 0,
    logsHoy: 0,
  })
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const [productos, usuarios, carritos, items, logs, recentProducts] = await Promise.all([
        adminQuery<{ id: string; estado: string; foto_principal?: string }[]>({
          op: "select",
          table: "productos",
          select: "id, estado, foto_principal",
        }),
        adminQuery<{ id: string }[]>({ op: "select", table: "usuarios", select: "id" }),
        adminQuery<{ id: string; usuario_id: string }[]>({
          op: "select",
          table: "carritos",
          select: "id, usuario_id",
        }),
        adminQuery<{ cantidad?: number }[]>({
          op: "select",
          table: "carrito_items",
          select: "cantidad",
        }),
        adminQuery<{ created_at: string }[]>({
          op: "select",
          table: "admin_logs",
          select: "id, created_at",
        }),
        adminQuery<RecentProduct[]>({
          op: "select",
          table: "productos",
          select: "id, nombre, estado, precio, created_at",
          order: { column: "created_at", ascending: false },
        }),
      ])

      const logsHoy = (logs ?? []).filter(
        (l) => new Date(l.created_at) >= today
      ).length
      const conFoto = productos.filter((p) => p.foto_principal).length
      const activos = productos.filter((p) => p.estado === "activo").length
      const inactivos = productos.filter((p) => p.estado === "inactivo").length
      setStats({
        totalProductos: productos.length,
        productosActivos: activos,
        productosInactivos: inactivos,
        productosConFoto: conFoto,
        productosSinFoto: productos.length - conFoto,
        totalUsuarios: usuarios?.length ?? 0,
        usuariosConCarrito: new Set(carritos.map((c) => c.usuario_id)).size,
        totalItemsCarrito: items.reduce((sum, i) => sum + (i.cantidad ?? 0), 0),
        logsHoy,
      })

      setRecentProducts((recentProducts ?? []).slice(0, 5))
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isMounted || isLoading) {
    return <LoadingSpinner />
  }

  const pctActivos =
    stats.totalProductos > 0
      ? Math.round((stats.productosActivos / stats.totalProductos) * 100)
      : 0

  const pctConFoto =
    stats.totalProductos > 0
      ? Math.round((stats.productosConFoto / stats.totalProductos) * 100)
      : 0

  return (
    <div className="space-y-8">
      {/* KPIs con donas */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Indicadores clave
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DonutKpi
            title="Catálogo activo"
            value={pctActivos}
            subtitle="% publicados"
            segments={[
              { value: stats.productosActivos, color: "#059669", label: "Activos" },
              { value: stats.productosInactivos, color: "#e2e8f0", label: "Inactivos" },
            ]}
          />

          <DonutKpi
            title="Total productos"
            value={stats.totalProductos}
            subtitle="en inventario"
            segments={[
              { value: stats.productosActivos, color: "#0f172a", label: "Activos" },
              { value: stats.productosInactivos, color: "#94a3b8", label: "Inactivos" },
            ]}
          />

          <DonutKpi
            title="Fotos de producto"
            value={pctConFoto}
            subtitle="% con imagen"
            segments={[
              { value: stats.productosConFoto, color: "#2563eb", label: "Con foto" },
              { value: stats.productosSinFoto, color: "#e2e8f0", label: "Sin foto" },
            ]}
          />

          <DonutKpi
            title="Clientes"
            value={stats.totalUsuarios}
            subtitle="registrados"
            segments={[
              { value: stats.usuariosConCarrito, color: "#7c3aed", label: "Con carrito" },
              {
                value: Math.max(0, stats.totalUsuarios - stats.usuariosConCarrito),
                color: "#e2e8f0",
                label: "Sin carrito",
              },
            ]}
          />
        </div>
      </section>

      {/* Métricas secundarias */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="flex items-center gap-3 border-slate-200/80 p-4 shadow-sm">
          <div className="rounded-lg bg-emerald-50 p-2">
            <ShoppingCart className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase text-slate-500">En carritos</p>
            <p className="text-xl font-bold text-slate-900">{stats.totalItemsCarrito}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border-slate-200/80 p-4 shadow-sm">
          <div className="rounded-lg bg-violet-50 p-2">
            <Package className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase text-slate-500">Activos</p>
            <p className="text-xl font-bold text-slate-900">{stats.productosActivos}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border-slate-200/80 p-4 shadow-sm">
          <div className="rounded-lg bg-blue-50 p-2">
            <ImageIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase text-slate-500">Con foto</p>
            <p className="text-xl font-bold text-slate-900">{stats.productosConFoto}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border-slate-200/80 p-4 shadow-sm">
          <div className="rounded-lg bg-amber-50 p-2">
            <Activity className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase text-slate-500">Logs hoy</p>
            <p className="text-xl font-bold text-slate-900">{stats.logsHoy}</p>
          </div>
        </Card>
      </div>

      {/* Acciones + recientes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-slate-200/80 p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-slate-900">Acciones rápidas</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <Link href="/admin/create">
              <Button className="h-11 w-full justify-start gap-2">
                <Plus className="h-4 w-4" />
                Crear producto
              </Button>
            </Link>
            <Link href="/admin/products">
              <Button variant="outline" className="h-11 w-full justify-start gap-2 border-slate-200">
                <Package className="h-4 w-4" />
                Ver catálogo
              </Button>
            </Link>
            <Link href="/admin/administradores">
              <Button variant="outline" className="h-11 w-full justify-start gap-2 border-slate-200">
                Gestionar admins
              </Button>
            </Link>
            <Link href="/admin/logs">
              <Button variant="outline" className="h-11 w-full justify-start gap-2 border-slate-200">
                Ver actividad
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="border-slate-200/80 p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">Últimos productos</h3>
            <Link href="/admin/products" className="text-xs font-medium text-emerald-700 hover:underline">
              Ver todos
            </Link>
          </div>
          {recentProducts.length === 0 ? (
            <p className="text-sm text-slate-500">Aún no hay productos. Crea el primero.</p>
          ) : (
            <ul className="space-y-2">
              {recentProducts.map((producto) => (
                <li
                  key={producto.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="truncate text-sm font-medium text-slate-900">{producto.nombre}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <Badge
                        variant={producto.estado === "activo" ? "default" : "secondary"}
                        className="text-[10px]"
                      >
                        {producto.estado}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        S/ {producto.precio ?? "—"}
                      </span>
                    </div>
                  </div>
                  <Link href={`/admin/edit/${producto.id}`}>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
