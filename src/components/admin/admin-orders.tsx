"use client"

import { useCallback, useEffect, useState } from "react"
import { adminQuery } from "@/lib/admin-api"
import type { Pedido, PedidoEstado, TipoEnvio } from "@/types/pedido"
import { PEDIDO_ESTADO_LABEL } from "@/types/pedido"
import { cn } from "@/lib/utils"
import { Package, MapPin, Phone, User } from "lucide-react"

type PedidoConItems = Pedido & {
  pedido_items?: {
    id: string
    producto_nombre: string
    color_nombre: string
    talla: string
    cantidad: number
    subtotal: number
  }[]
}

const ESTADOS: PedidoEstado[] = [
  "pagado",
  "en_preparacion",
  "enviado",
  "entregado",
  "cancelado",
]

export function AdminOrders() {
  const [tab, setTab] = useState<"todos" | TipoEnvio>("todos")
  const [pedidos, setPedidos] = useState<PedidoConItems[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const data = await adminQuery<PedidoConItems[]>({
        table: "pedidos",
        op: "select",
        select: "*, pedido_items(*)",
        order: { column: "created_at", ascending: false },
      })
      const list = (data ?? []).filter((p) => p.estado !== "pendiente_pago")
      setPedidos(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar pedidos")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered =
    tab === "todos" ? pedidos : pedidos.filter((p) => p.tipo_envio === tab)

  const updateEstado = async (id: string, estado: PedidoEstado) => {
    try {
      await adminQuery({
        table: "pedidos",
        op: "update",
        match: { id },
        data: { estado },
      })
      setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, estado } : p)))
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al actualizar")
    }
  }

  const limaCount = pedidos.filter((p) => p.tipo_envio === "lima").length
  const provCount = pedidos.filter((p) => p.tipo_envio === "provincia").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pedidos en línea</h1>
        <p className="text-slate-600 text-sm mt-1">
          Pagos con Culqi. Lima: metropolitana S/15 · departamento S/20. Provincia: S/10 hasta agencia Shalom.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            { key: "todos" as const, label: `Todos (${pedidos.length})` },
            { key: "lima" as const, label: `Lima (${limaCount})` },
            { key: "provincia" as const, label: `Provincia (${provCount})` },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              tab === key
                ? "bg-emerald-600 text-white"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            )}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={load}
          className="ml-auto text-sm text-emerald-700 hover:underline"
        >
          Actualizar
        </button>
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg p-3">{error}</p>
      )}

      {loading ? (
        <p className="text-slate-500">Cargando pedidos…</p>
      ) : filtered.length === 0 ? (
        <p className="text-slate-500 bg-white rounded-lg border p-8 text-center">
          No hay pedidos pagados en esta categoría.
        </p>
      ) : (
        <div className="space-y-4">
          {filtered.map((pedido) => (
            <article
              key={pedido.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b bg-slate-50/80">
                <div>
                  <p className="font-semibold text-slate-900">{pedido.numero_pedido}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(pedido.created_at).toLocaleString("es-PE")} ·{" "}
                    <span
                      className={cn(
                        "font-medium",
                        pedido.tipo_envio === "lima" ? "text-blue-700" : "text-amber-700"
                      )}
                    >
                      {pedido.tipo_envio === "lima" ? "Lima" : "Provincia"}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-emerald-700">
                    S/{Number(pedido.total).toFixed(2)}
                  </span>
                  <select
                    value={pedido.estado}
                    onChange={(e) => updateEstado(pedido.id, e.target.value as PedidoEstado)}
                    className="text-sm border rounded-md px-2 py-1"
                  >
                    {ESTADOS.map((s) => (
                      <option key={s} value={s}>
                        {PEDIDO_ESTADO_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p className="font-medium text-slate-800 flex items-center gap-2">
                    <User className="h-4 w-4" /> Cliente
                  </p>
                  <p>{pedido.nombre_cliente}</p>
                  <p className="flex items-center gap-2 text-slate-600">
                    <Phone className="h-3.5 w-3.5" />
                    <a href={`https://wa.me/51${pedido.telefono.replace(/\D/g, "")}`} className="hover:underline">
                      {pedido.telefono}
                    </a>
                  </p>
                  <p className="text-slate-600">{pedido.email_cliente}</p>
                  {pedido.dni && <p className="text-slate-600">DNI: {pedido.dni}</p>}
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-slate-800 flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Envío
                  </p>
                  <p>
                    {pedido.provincia}
                    {pedido.distrito ? ` — ${pedido.distrito}` : ""}
                  </p>
                  {pedido.direccion && <p>{pedido.direccion}</p>}
                  {pedido.referencia && (
                    <p className="text-slate-500">Ref: {pedido.referencia}</p>
                  )}
                  {pedido.tipo_envio === "provincia" && (
                    <p className="text-amber-800 bg-amber-50 rounded px-2 py-1 text-xs">
                      {pedido.empresa_envio}: {pedido.sede_envio}
                    </p>
                  )}
                  {pedido.tipo_envio === "lima" && pedido.costo_envio > 0 && (
                    <p className="text-slate-600">Envío pagado: S/{Number(pedido.costo_envio).toFixed(2)}</p>
                  )}
                </div>
              </div>

              <div className="px-4 pb-4">
                <p className="font-medium text-slate-800 flex items-center gap-2 mb-2 text-sm">
                  <Package className="h-4 w-4" /> Productos
                </p>
                <ul className="text-sm text-slate-700 space-y-1">
                  {(pedido.pedido_items ?? []).map((item) => (
                    <li key={item.id} className="flex justify-between gap-2">
                      <span>
                        {item.producto_nombre} · {item.color_nombre} · T{item.talla} ×{item.cantidad}
                      </span>
                      <span>S/{Number(item.subtotal).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
