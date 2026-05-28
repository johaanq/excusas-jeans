"use client"

import { useCallback, useEffect, useState } from "react"
import { adminAuthedPost, adminQuery } from "@/lib/admin-api"
import type { Pedido, PedidoEstado, TipoEnvio } from "@/types/pedido"
import { PEDIDO_ESTADO_LABEL } from "@/types/pedido"
import { cn } from "@/lib/utils"
import { Package, MapPin, Phone, User, ReceiptText, CalendarDays } from "lucide-react"

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
  "pendiente_pago",
  "pagado",
  "en_preparacion",
  "enviado",
  "entregado",
  "cancelado",
]

function money(value: number) {
  return `S/${Number(value).toFixed(2)}`
}

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
      setPedidos(data ?? [])
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
      let comprobanteUrl: string | null = null
      if (estado === "enviado") {
        const value = window.prompt(
          "Pega la URL de la foto/comprobante de envío (requerido para estado Enviado):"
        )
        if (!value?.trim()) return
        comprobanteUrl = value.trim()
      }

      const result = await adminAuthedPost<{
        ok: boolean
        emailSent: boolean
        whatsappUrl: string
      }>("/api/admin/pedidos/status", {
        pedidoId: id,
        estado,
        comprobanteUrl,
      })

      if (result.whatsappUrl && (estado === "en_preparacion" || estado === "enviado")) {
        window.open(result.whatsappUrl, "_blank", "noopener,noreferrer")
      }

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
        <h1 className="text-2xl font-semibold text-slate-900">Pedidos en línea</h1>
        <p className="mt-1 text-sm text-slate-600">
          Lima: metropolitana S/15 · departamento S/20. Provincia: S/9 hasta agencia Shalom.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
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
              "border-b-2 px-3 py-1.5 text-sm transition-colors",
              tab === key
                ? "border-slate-900 font-medium text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={load}
          className="ml-auto border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
        >
          Actualizar
        </button>
      </div>

      {error && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>
      )}

      {loading ? (
        <p className="text-slate-500">Cargando pedidos…</p>
      ) : filtered.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          No hay pedidos pagados en esta categoría.
        </p>
      ) : (
        <div className="space-y-5">
          {filtered.map((pedido) => (
            <article key={pedido.id} className="overflow-hidden border border-slate-200 bg-white">
              <div className="border-b border-slate-200 bg-slate-50/80 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <p className="text-base font-semibold text-slate-900">{pedido.numero_pedido}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {new Date(pedido.created_at).toLocaleString("es-PE")}
                      </span>
                      <span>·</span>
                      <span className="font-medium">
                        {pedido.tipo_envio === "lima" ? "Lima" : "Provincia"}
                      </span>
                      <span>·</span>
                      <span className="font-medium text-slate-700">
                        {PEDIDO_ESTADO_LABEL[pedido.estado]}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-slate-900">{money(pedido.total)}</span>
                    <select
                      value={pedido.estado}
                      onChange={(e) => updateEstado(pedido.id, e.target.value as PedidoEstado)}
                      className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
                    >
                      {ESTADOS.map((s) => (
                        <option key={s} value={s}>
                          {PEDIDO_ESTADO_LABEL[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 p-4 text-sm md:grid-cols-2">
                <div className="border border-slate-200 bg-slate-50/50 p-3">
                  <p className="mb-2 flex items-center gap-2 font-medium text-slate-800">
                    <User className="h-4 w-4" /> Cliente
                  </p>
                  <p className="text-slate-900">{pedido.nombre_cliente}</p>
                  <p className="mt-1 flex items-center gap-2 text-slate-600">
                    <Phone className="h-3.5 w-3.5" />
                    <a href={`https://wa.me/51${pedido.telefono.replace(/\D/g, "")}`} className="hover:underline">
                      {pedido.telefono}
                    </a>
                  </p>
                  <p className="mt-1 text-slate-600">{pedido.email_cliente}</p>
                  {pedido.dni && <p className="mt-1 text-slate-600">DNI: {pedido.dni}</p>}
                </div>
                <div className="border border-slate-200 bg-slate-50/50 p-3">
                  <p className="mb-2 flex items-center gap-2 font-medium text-slate-800">
                    <MapPin className="h-4 w-4" /> Envío
                  </p>
                  <p className="text-slate-900">
                    {pedido.provincia}
                    {pedido.distrito ? ` — ${pedido.distrito}` : ""}
                  </p>
                  {pedido.direccion && <p className="mt-1 text-slate-700">{pedido.direccion}</p>}
                  {pedido.referencia && (
                    <p className="mt-1 text-slate-500">Ref: {pedido.referencia}</p>
                  )}
                  {pedido.tipo_envio === "provincia" && (
                    <p className="mt-2 border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-800">
                      {pedido.empresa_envio}: {pedido.sede_envio}
                    </p>
                  )}
                  {pedido.tipo_envio === "lima" && pedido.costo_envio > 0 && (
                    <p className="mt-1 text-slate-600">Envío pagado: {money(pedido.costo_envio)}</p>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-200 px-4 py-4">
                <p className="mb-3 flex items-center gap-2 font-medium text-slate-800">
                  <Package className="h-4 w-4" /> Detalle de productos
                </p>
                <div className="space-y-2">
                  {(pedido.pedido_items ?? []).map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[1.2fr_1fr_80px_80px_100px] items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-sm"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{item.producto_nombre}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                          <ReceiptText className="h-3.5 w-3.5" />
                          Modelo
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-700">{item.color_nombre}</p>
                        <p className="mt-0.5 text-xs text-slate-500">Color</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-slate-800">T{item.talla}</p>
                        <p className="mt-0.5 text-xs text-slate-500">Talla</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-slate-800">{item.cantidad}</p>
                        <p className="mt-0.5 text-xs text-slate-500">Cant.</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">{money(item.subtotal)}</p>
                        <p className="mt-0.5 text-xs text-slate-500">Subtotal</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
