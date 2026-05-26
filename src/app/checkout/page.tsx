"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert } from "@/components/ui/alert"
import { useCart } from "@/hooks/use-cart"
import { useUserAuth } from "@/contexts/user-auth-context"
import { PROVINCIAS_PERU, DISTRITOS_LIMA } from "@/lib/peru-locations"
import { isLimaProvincia, getProvinciaShippingNote } from "@/lib/shipping"
import { WHATSAPP_URL } from "@/lib/site"
import { Loader2, CreditCard } from "lucide-react"
import {
  CulqiCheckoutButton,
  type CulqiPaySession,
} from "@/components/checkout/culqi-checkout"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCart()
  const { user, isAuthenticated, isLoading: authLoading } = useUserAuth()

  const [error, setError] = useState("")
  const [shippingCost, setShippingCost] = useState<number | null>(null)
  const [shippingNote, setShippingNote] = useState("")

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    dni: "",
    provincia: "Lima",
    distrito: "",
    direccion: "",
    referencia: "",
    sede_envio: "",
  })

  useEffect(() => {
    if (!authLoading && items.length === 0) {
      router.replace("/catalogo")
    }
  }, [authLoading, items.length, router])

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        nombre: user.nombre || f.nombre,
        email: user.email || f.email,
        telefono: user.telefono || f.telefono,
        dni: user.dni || f.dni,
        provincia: user.provincia || f.provincia,
        distrito: user.distrito || f.distrito,
        direccion: user.direccion || f.direccion,
        referencia: user.referencia || f.referencia,
        sede_envio: user.sede_envio || f.sede_envio,
      }))
    }
  }, [user])

  const esLima = isLimaProvincia(form.provincia)
  const subtotal = getTotalPrice()
  const envio = esLima ? (shippingCost ?? 0) : 0
  const total = subtotal + (esLima && shippingCost != null ? shippingCost : esLima ? 0 : 0)

  const canPay = useMemo(() => {
    if (!items.length) return false
    if (!form.nombre || !form.email || !form.telefono || !form.provincia) return false
    if (esLima) {
      return Boolean(form.distrito && form.direccion && shippingCost != null)
    }
    return Boolean(form.sede_envio.trim())
  }, [items.length, form, esLima, shippingCost])

  useEffect(() => {
    const fetchQuote = async () => {
      if (!form.provincia) return
      const params = new URLSearchParams({ provincia: form.provincia })
      if (esLima && form.distrito) params.set("distrito", form.distrito)
      const res = await fetch(`/api/shipping/quote?${params}`)
      const data = await res.json()
      if (res.ok) {
        setShippingNote(data.mensaje ?? "")
        setShippingCost(data.costo_envio ?? 0)
      }
    }
    fetchQuote()
  }, [form.provincia, form.distrito, esLima])

  const buildShippingPayload = () => ({
    tipo_envio: (esLima ? "lima" : "provincia") as "lima" | "provincia",
    nombre_cliente: form.nombre.trim(),
    email_cliente: form.email.trim(),
    telefono: form.telefono.trim(),
    dni: form.dni.trim() || undefined,
    provincia: form.provincia,
    distrito: esLima ? form.distrito : undefined,
    direccion: esLima ? form.direccion : undefined,
    referencia: form.referencia.trim() || undefined,
    empresa_envio: esLima ? undefined : "Shalom",
    sede_envio: esLima ? undefined : form.sede_envio.trim(),
  })

  const prepareCulqi = async (): Promise<CulqiPaySession> => {
    setError("")
    const res = await fetch("/api/checkout/prepare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuario_id: isAuthenticated ? user?.id : null,
        items: items.map((i) => ({
          producto_id: i.producto.id,
          color_id: i.color.id,
          talla: i.talla,
          cantidad: i.cantidad,
        })),
        shipping: buildShippingPayload(),
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "No se pudo preparar el pago")
    return data as CulqiPaySession
  }

  const chargeCulqi = async (tokenId: string, session: CulqiPaySession) => {
    const res = await fetch("/api/checkout/charge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pedido_id: session.pedido_id,
        token_id: tokenId,
        email: session.email,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "No se pudo procesar el pago")
    clearCart()
    router.push(`/checkout/exito?pedido=${encodeURIComponent(data.numero_pedido)}`)
  }

  if (authLoading || items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12 mt-20 max-w-5xl">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
        <p className="text-gray-600 mb-8">
          Pago seguro con Culqi (tarjeta, Yape y billeteras). En provincia el envío es por Shalom
          (flete no incluido en el pago online).
        </p>

        {error && (
          <Alert variant="destructive" className="mb-6">
            {error}
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6 bg-white rounded-lg border p-6">
            <h2 className="font-semibold text-lg">Datos de envío</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="nombre">Nombre completo</Label>
                <Input
                  id="nombre"
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Correo (cuenta / comprobante de pago)</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="telefono">WhatsApp / teléfono</Label>
                <Input
                  id="telefono"
                  value={form.telefono}
                  onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="dni">DNI (opcional)</Label>
                <Input
                  id="dni"
                  value={form.dni}
                  onChange={(e) => setForm((f) => ({ ...f, dni: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="provincia">Provincia</Label>
                <select
                  id="provincia"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={form.provincia}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      provincia: e.target.value,
                      distrito: "",
                    }))
                  }
                >
                  {PROVINCIAS_PERU.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {esLima ? (
                <>
                  <div>
                    <Label htmlFor="distrito">Distrito (Lima)</Label>
                    <select
                      id="distrito"
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                      value={form.distrito}
                      onChange={(e) => setForm((f) => ({ ...f, distrito: e.target.value }))}
                    >
                      <option value="">Seleccionar distrito</option>
                      {DISTRITOS_LIMA.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input
                      id="direccion"
                      value={form.direccion}
                      onChange={(e) => setForm((f) => ({ ...f, direccion: e.target.value }))}
                      required
                    />
                  </div>
                </>
              ) : (
                <div className="sm:col-span-2">
                  <Label htmlFor="sede">Sede Shalom de destino</Label>
                  <Input
                    id="sede"
                    placeholder="Ej: Agencia Shalom — ciudad y dirección de la sede"
                    value={form.sede_envio}
                    onChange={(e) => setForm((f) => ({ ...f, sede_envio: e.target.value }))}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">{getProvinciaShippingNote()}</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Si no hay Shalom en tu provincia,{" "}
                    <a href={WHATSAPP_URL} className="underline" target="_blank" rel="noopener noreferrer">
                      escríbenos por WhatsApp
                    </a>{" "}
                    para otra agencia (Flores u otra).
                  </p>
                </div>
              )}

              <div className="sm:col-span-2">
                <Label htmlFor="referencia">Referencia (opcional)</Label>
                <Textarea
                  id="referencia"
                  rows={2}
                  value={form.referencia}
                  onChange={(e) => setForm((f) => ({ ...f, referencia: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border p-6 sticky top-24 space-y-4">
              <h2 className="font-semibold text-lg">Resumen</h2>
              <ul className="space-y-2 text-sm text-gray-700 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <li
                    key={`${item.producto.id}-${item.color.id}-${item.talla}`}
                    className="flex justify-between gap-2"
                  >
                    <span className="line-clamp-2">
                      {item.producto.nombre} · {item.color.nombre} · T{item.talla} ×
                      {item.cantidad}
                    </span>
                    <span className="shrink-0">
                      S/{((item.producto.precio ?? 0) * item.cantidad).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="border-t pt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>S/{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span>
                    {esLima
                      ? shippingCost != null
                        ? `S/${shippingCost.toFixed(2)}`
                        : "—"
                      : "No incluido (Shalom)"}
                  </span>
                </div>
                {shippingNote && (
                  <p className="text-xs text-gray-500 pt-1">{shippingNote}</p>
                )}
                <div className="flex justify-between font-bold text-base pt-2">
                  <span>Total a pagar</span>
                  <span>
                    S/
                    {(esLima && shippingCost == null
                      ? subtotal
                      : subtotal + (esLima ? shippingCost ?? 0 : 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
              <CulqiCheckoutButton
                onPrepare={prepareCulqi}
                onToken={async (tokenId, session) => {
                  try {
                    await chargeCulqi(tokenId, session)
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Error al pagar")
                  }
                }}
                disabled={!canPay}
              >
                {({ pay, loading: culqiLoading, ready }) => (
                  <Button
                    className="w-full"
                    size="lg"
                    disabled={!canPay || culqiLoading || !ready}
                    onClick={pay}
                  >
                    {culqiLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CreditCard className="h-4 w-4 mr-2" />
                    )}
                    Pagar con Culqi
                  </Button>
                )}
              </CulqiCheckoutButton>
              <p className="text-xs text-gray-500 text-center">
                Tarjeta, Yape y billeteras según Culqi. Tras el pago te confirmamos por WhatsApp.
              </p>
              <Link href="/catalogo" className="block text-center text-sm text-gray-600 hover:underline">
                Seguir comprando
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
