"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { KpiPanel } from "@/components/admin/kpi-panel"
import { Edit } from "lucide-react"
import { adminQuery } from "@/lib/admin-api"
import { useAdminPath } from "@/hooks/use-admin-path"
import Link from "next/link"
import type { PedidoEstado } from "@/types/pedido"
import { PEDIDO_ESTADO_LABEL } from "@/types/pedido"
import {
  buildDailySeries,
  countByDay,
  formatSoles,
  getLastNDayKeys,
  sumByDay,
} from "@/lib/dashboard-stats"

const CHART_DAYS = 7

const ESTADO_COLORS: Record<PedidoEstado, string> = {
  pendiente_pago: "#d97706",
  pagado: "#059669",
  en_preparacion: "#2563eb",
  enviado: "#7c3aed",
  entregado: "#0f172a",
  cancelado: "#cbd5e1",
}

const VENTA_ESTADOS: PedidoEstado[] = [
  "pagado",
  "en_preparacion",
  "enviado",
  "entregado",
]

interface PedidoRow {
  id: string
  estado: PedidoEstado
  tipo_envio: "lima" | "provincia"
  total: number
  created_at: string
  paid_at: string | null
}

interface RecentProduct {
  id: string
  nombre: string
  estado: string
  precio?: number
  created_at: string
}

interface ProductoRow {
  id: string
  estado: string
  foto_principal?: string
  created_at: string
}

export function AdminDashboard() {
  const { adminPath } = useAdminPath()
  const [pedidos, setPedidos] = useState<PedidoRow[]>([])
  const [productos, setProductos] = useState<ProductoRow[]>([])
  const [totalUsuarios, setTotalUsuarios] = useState(0)
  const [usuariosConCarrito, setUsuariosConCarrito] = useState(0)
  const [reclamosCount, setReclamosCount] = useState(0)
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [
        pedidosData,
        productosData,
        usuarios,
        carritos,
        reclamos,
        recentProductsData,
      ] = await Promise.all([
        adminQuery<PedidoRow[]>({
          op: "select",
          table: "pedidos",
          select: "id, estado, tipo_envio, total, created_at, paid_at",
          order: { column: "created_at", ascending: false },
        }),
        adminQuery<ProductoRow[]>({
          op: "select",
          table: "productos",
          select: "id, estado, foto_principal, created_at",
        }),
        adminQuery<{ id: string }[]>({ op: "select", table: "usuarios", select: "id" }),
        adminQuery<{ usuario_id: string }[]>({
          op: "select",
          table: "carritos",
          select: "usuario_id",
        }),
        adminQuery<{ id: string }[]>({
          op: "select",
          table: "libro_reclamaciones",
          select: "id",
        }),
        adminQuery<RecentProduct[]>({
          op: "select",
          table: "productos",
          select: "id, nombre, estado, precio, created_at",
          order: { column: "created_at", ascending: false },
        }),
      ])

      setPedidos(pedidosData ?? [])
      setProductos(productosData ?? [])
      setTotalUsuarios(usuarios?.length ?? 0)
      setUsuariosConCarrito(new Set((carritos ?? []).map((c) => c.usuario_id)).size)
      setReclamosCount(reclamos?.length ?? 0)
      setRecentProducts((recentProductsData ?? []).slice(0, 6))
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const dayKeys = useMemo(() => getLastNDayKeys(CHART_DAYS), [])

  const metrics = useMemo(() => {
    const activos = productos.filter((p) => p.estado === "activo").length
    const inactivos = productos.length - activos
    const conFoto = productos.filter((p) => p.foto_principal).length

    const porEstado = new Map<PedidoEstado, number>()
    for (const e of Object.keys(ESTADO_COLORS) as PedidoEstado[]) {
      porEstado.set(e, 0)
    }
    for (const p of pedidos) {
      porEstado.set(p.estado, (porEstado.get(p.estado) ?? 0) + 1)
    }

    const ventasPedidos = pedidos.filter((p) => VENTA_ESTADOS.includes(p.estado))
    const ingresosTotales = ventasPedidos.reduce((s, p) => s + Number(p.total), 0)
    const lima = ventasPedidos.filter((p) => p.tipo_envio === "lima").length
    const provincia = ventasPedidos.filter((p) => p.tipo_envio === "provincia").length

    const pedidosPorDia = countByDay(pedidos, (p) => p.created_at)
    const ingresosPorDia = sumByDay(
      ventasPedidos,
      (p) => p.paid_at ?? p.created_at,
      (p) => Number(p.total)
    )
    const productosPorDia = countByDay(productos, (p) => p.created_at)

    const pendientes = porEstado.get("pendiente_pago") ?? 0
    const pagados = porEstado.get("pagado") ?? 0
    const enCurso =
      (porEstado.get("en_preparacion") ?? 0) +
      (porEstado.get("enviado") ?? 0) +
      (porEstado.get("entregado") ?? 0)

    return {
      activos,
      inactivos,
      conFoto,
      sinFoto: productos.length - conFoto,
      porEstado,
      ingresosTotales,
      lima,
      provincia,
      pendientes,
      pagados,
      enCurso,
      pedidosLine: buildDailySeries(dayKeys, pedidosPorDia),
      ingresosLine: buildDailySeries(dayKeys, ingresosPorDia),
      productosLine: buildDailySeries(dayKeys, productosPorDia),
    }
  }, [pedidos, productos, dayKeys])

  if (!isMounted || isLoading) {
    return <LoadingSpinner />
  }

  const estadoSegments = (Object.keys(ESTADO_COLORS) as PedidoEstado[])
    .map((estado) => ({
      value: metrics.porEstado.get(estado) ?? 0,
      color: ESTADO_COLORS[estado],
      label: PEDIDO_ESTADO_LABEL[estado],
    }))
    .filter((s) => s.value > 0)

  const pctActivos =
    productos.length > 0 ? Math.round((metrics.activos / productos.length) * 100) : 0

  return (
    <div className="space-y-8">
      {/* Resumen superior */}
      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 lg:grid-cols-4">
        <div className="bg-white px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Ingresos confirmados
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
            {formatSoles(metrics.ingresosTotales)}
          </p>
        </div>
        <div className="bg-white px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Pedidos totales
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
            {pedidos.length}
          </p>
        </div>
        <div className="bg-white px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Pendientes de pago
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-amber-700">
            {metrics.pendientes}
          </p>
        </div>
        <div className="bg-white px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Productos activos
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
            {metrics.activos}
            <span className="text-sm font-normal text-slate-400"> / {productos.length}</span>
          </p>
        </div>
      </section>

      {/* KPIs: dona + línea */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Indicadores</h2>
          <p className="text-xs text-slate-500">Últimos {CHART_DAYS} días en gráficos de tendencia</p>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <KpiPanel
            heading="Pedidos por estado"
            description="Distribución actual del pipeline de ventas"
            donutTitle="Total pedidos"
            donutValue={pedidos.length}
            donutSubtitle="registrados"
            segments={
              estadoSegments.length > 0
                ? estadoSegments
                : [{ value: 1, color: "#e2e8f0", label: "Sin pedidos" }]
            }
            lineTitle="Pedidos creados por día"
            lineData={metrics.pedidosLine}
          />

          <KpiPanel
            heading="Ingresos"
            description="Pedidos pagados, en preparación, enviados o entregados"
            donutTitle="Ventas"
            donutValue={formatSoles(metrics.ingresosTotales)}
            donutSubtitle={`${VENTA_ESTADOS.reduce((n, e) => n + (metrics.porEstado.get(e) ?? 0), 0)} pedidos`}
            segments={[
              { value: metrics.pendientes, color: "#d97706", label: "Pendiente pago" },
              {
                value: metrics.ingresosTotales > 0 ? metrics.pagados + metrics.enCurso : 0,
                color: "#059669",
                label: "Confirmados",
              },
              {
                value: metrics.porEstado.get("cancelado") ?? 0,
                color: "#cbd5e1",
                label: "Cancelados",
              },
            ].filter((s) => s.value > 0)}
            lineTitle="Ingresos por día (S/)"
            lineData={metrics.ingresosLine}
            linePrefix="S/ "
            formatLineValue={(n) =>
              n.toLocaleString("es-PE", { maximumFractionDigits: 0 })
            }
          />

          <KpiPanel
            heading="Envíos"
            description="Pedidos confirmados según destino"
            donutTitle="Lima vs provincia"
            donutValue={metrics.lima + metrics.provincia}
            donutSubtitle="confirmados"
            segments={[
              { value: metrics.lima, color: "#0f172a", label: "Lima" },
              { value: metrics.provincia, color: "#94a3b8", label: "Provincia" },
            ]}
            lineTitle="Pedidos creados por día"
            lineData={metrics.pedidosLine}
          />

          <KpiPanel
            heading="Catálogo"
            description="Estado de publicación y altas recientes"
            donutTitle="Activos"
            donutValue={`${pctActivos}%`}
            donutSubtitle={`${metrics.activos} de ${productos.length}`}
            segments={[
              { value: metrics.activos, color: "#0f172a", label: "Activos" },
              { value: metrics.inactivos, color: "#e2e8f0", label: "Inactivos" },
            ]}
            lineTitle="Productos creados por día"
            lineData={metrics.productosLine}
          />
        </div>
      </section>

      {/* Fila contextual */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-slate-200/90 bg-white px-5 py-4 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Clientes registrados
          </p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{totalUsuarios}</p>
          <p className="mt-1 text-xs text-slate-500">
            {usuariosConCarrito} con carrito activo
          </p>
        </Card>
        <Card className="border-slate-200/90 bg-white px-5 py-4 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Fotos en catálogo
          </p>
          <p className="mt-1 text-xl font-semibold text-slate-900">
            {metrics.conFoto}
            <span className="text-sm font-normal text-slate-400"> / {productos.length}</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">{metrics.sinFoto} sin imagen principal</p>
        </Card>
        <Card className="border-slate-200/90 bg-white px-5 py-4 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Libro de reclamaciones
          </p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{reclamosCount}</p>
          <p className="mt-1 text-xs text-slate-500">hojas registradas</p>
        </Card>
      </section>

      {/* Últimos productos */}
      <Card className="border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Últimos productos</h3>
            <p className="text-xs text-slate-500">Altas recientes en el catálogo</p>
          </div>
          <Link
            href={adminPath('/products')}
            className="text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            Ver catálogo →
          </Link>
        </div>
        {recentProducts.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-500">Aún no hay productos en el catálogo.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3 font-medium">Producto</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 font-medium">Precio</th>
                  <th className="px-5 py-3 font-medium w-16" />
                </tr>
              </thead>
              <tbody>
                {recentProducts.map((producto) => (
                  <tr key={producto.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-5 py-3 font-medium text-slate-900">{producto.nombre}</td>
                    <td className="px-5 py-3">
                      <Badge
                        variant={producto.estado === "activo" ? "default" : "secondary"}
                        className="text-[10px] font-normal"
                      >
                        {producto.estado}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 tabular-nums text-slate-600">
                      {producto.precio != null ? formatSoles(Number(producto.precio)) : "—"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`${adminPath("/products")}?edit=${producto.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
