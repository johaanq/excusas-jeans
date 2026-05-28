"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Lock } from "lucide-react"
import { CheckoutHeader } from "@/components/checkout/checkout-header"
import { CheckoutOrderSummary } from "@/components/checkout/checkout-order-summary"
import { CheckoutPolicyModals } from "@/components/checkout/checkout-policy-modals"
import {
  CulqiCheckoutButton,
  type CulqiPaySession,
} from "@/components/checkout/culqi-checkout"
import { Alert } from "@/components/ui/alert"
import { useCart } from "@/hooks/use-cart"
import { useUserAuth } from "@/contexts/user-auth-context"
import { PROVINCIAS_PERU, DISTRITOS_LIMA } from "@/lib/peru-locations"
import { isLimaProvincia } from "@/lib/shipping"
import {
  computeWelcomeDiscountAmount,
  WELCOME_DISCOUNT_PERCENT,
} from "@/lib/welcome-discount"
import { WHATSAPP_URL } from "@/lib/site"
import { cn } from "@/lib/utils"

const inputClass =
  "flex h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-900 shadow-sm transition-colors placeholder:text-stone-400 focus:border-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-800"

const labelClass = "mb-1.5 block text-sm font-medium text-stone-800"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const { user, isAuthenticated, isLoading: authLoading } = useUserAuth()
  const hasCulqiPublicKey = Boolean(process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY?.trim())

  const [error, setError] = useState("")
  const [shippingCost, setShippingCost] = useState<number | null>(null)
  const [shippingNote, setShippingNote] = useState("")
  const [shippingMethod, setShippingMethod] = useState<string | null>(null)
  const [welcomeEligible, setWelcomeEligible] = useState(false)

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
  const subtotal = totalPrice
  const applyWelcomeDiscount = isAuthenticated && welcomeEligible
  const discountAmount = applyWelcomeDiscount ? computeWelcomeDiscountAmount(subtotal) : 0

  useEffect(() => {
    const checkDiscount = async () => {
      if (!isAuthenticated || !user?.id) {
        setWelcomeEligible(false)
        return
      }
      const params = new URLSearchParams({ usuario_id: user.id })
      if (form.email.trim()) params.set("email", form.email.trim())
      const res = await fetch(`/api/checkout/welcome-discount?${params}`)
      const data = await res.json()
      setWelcomeEligible(Boolean(res.ok && data.eligible))
    }
    if (!authLoading) void checkDiscount()
  }, [isAuthenticated, user?.id, form.email, authLoading])

  const canPay = useMemo(() => {
    if (!items.length) return false
    if (
      !form.nombre.trim() ||
      !form.email.trim() ||
      !form.telefono.trim() ||
      !form.dni.trim() ||
      !form.provincia
    ) {
      return false
    }
    if (shippingCost == null) return false
    if (esLima) {
      return Boolean(form.distrito && form.direccion.trim())
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
        setShippingMethod(data.metodo ?? null)
        setShippingCost(
          typeof data.costo_envio === "number" ? data.costo_envio : null
        )
      }
    }
    fetchQuote()
  }, [form.provincia, form.distrito, esLima])

  const buildShippingPayload = () => ({
    tipo_envio: (esLima ? "lima" : "provincia") as "lima" | "provincia",
    nombre_cliente: form.nombre.trim(),
    email_cliente: form.email.trim(),
    telefono: form.telefono.trim(),
    dni: form.dni.trim(),
    provincia: form.provincia,
    distrito: esLima ? form.distrito : undefined,
    direccion: esLima ? form.direccion : undefined,
    referencia: form.referencia.trim() || undefined,
    empresa_envio: esLima ? undefined : "Shalom",
    sede_envio: esLima ? undefined : form.sede_envio.trim(),
  })

  const prepareCulqi = async (): Promise<CulqiPaySession> => {
    setError("")
    if (!hasCulqiPublicKey) {
      throw new Error("Pasarela no configurada: falta NEXT_PUBLIC_CULQI_PUBLIC_KEY")
    }
    const res = await fetch("/api/checkout/prepare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuario_id: isAuthenticated ? user?.id : null,
        apply_welcome_discount: applyWelcomeDiscount,
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
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <CheckoutHeader />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
        {error && (
          <Alert variant="destructive" className="mb-6">
            {error}
          </Alert>
        )}

        {!isAuthenticated ? (
          <div className="mb-6 rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
            <Link href="/cuenta?redirect=/checkout" className="font-medium text-stone-900 underline">
              Regístrate
            </Link>{" "}
            y obtén {WELCOME_DISCOUNT_PERCENT}% de descuento en tu primera compra (solo con cuenta
            activa).
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px] lg:gap-12">
          <div className="space-y-8">
            {/* Contacto */}
            <section>
              <div className="mb-4 flex items-baseline justify-between gap-4">
                <h2 className="text-lg font-semibold text-stone-900">Contacto</h2>
                {!isAuthenticated && (
                  <Link
                    href="/cuenta?redirect=/checkout"
                    className="text-sm text-stone-600 underline-offset-4 hover:text-stone-900 hover:underline"
                  >
                    Iniciar sesión
                  </Link>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className={labelClass}>
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className={inputClass}
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="telefono" className={labelClass}>
                      Teléfono
                    </label>
                    <input
                      id="telefono"
                      type="tel"
                      autoComplete="tel"
                      className={inputClass}
                      value={form.telefono}
                      onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="dni" className={labelClass}>
                      DNI o C.E.
                    </label>
                    <input
                      id="dni"
                      inputMode="numeric"
                      autoComplete="off"
                      className={inputClass}
                      value={form.dni}
                      onChange={(e) => setForm((f) => ({ ...f, dni: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Entrega */}
            <section>
              <h2 className="mb-4 text-lg font-semibold text-stone-900">Entrega</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="nombre" className={labelClass}>
                    Nombre y apellidos
                  </label>
                  <input
                    id="nombre"
                    autoComplete="name"
                    className={inputClass}
                    value={form.nombre}
                    onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="provincia" className={labelClass}>
                    Departamento / provincia
                  </label>
                  <select
                    id="provincia"
                    className={inputClass}
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
                      <label htmlFor="distrito" className={labelClass}>
                        Distrito (Lima)
                      </label>
                      <select
                        id="distrito"
                        className={inputClass}
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
                    <div>
                      <label htmlFor="direccion" className={labelClass}>
                        Dirección
                      </label>
                      <input
                        id="direccion"
                        autoComplete="street-address"
                        className={inputClass}
                        value={form.direccion}
                        onChange={(e) => setForm((f) => ({ ...f, direccion: e.target.value }))}
                        required
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label htmlFor="sede" className={labelClass}>
                      Sede Shalom de destino
                    </label>
                    <input
                      id="sede"
                      className={inputClass}
                      placeholder="Ciudad y dirección de la agencia"
                      value={form.sede_envio}
                      onChange={(e) => setForm((f) => ({ ...f, sede_envio: e.target.value }))}
                      required
                    />
                    <p className="mt-2 text-xs leading-relaxed text-stone-500">
                      Si no hay Shalom en tu zona,{" "}
                      <a
                        href={WHATSAPP_URL}
                        className="font-medium text-stone-700 underline underline-offset-2"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        escríbenos por WhatsApp
                      </a>{" "}
                      para coordinar otra agencia.
                    </p>
                  </div>
                )}

                <div>
                  <label htmlFor="referencia" className={labelClass}>
                    Referencia (opcional)
                  </label>
                  <textarea
                    id="referencia"
                    rows={2}
                    className={cn(inputClass, "h-auto min-h-[4.5rem] py-2.5")}
                    value={form.referencia}
                    onChange={(e) => setForm((f) => ({ ...f, referencia: e.target.value }))}
                  />
                </div>
              </div>
            </section>

            {/* Método de envío */}
            {shippingMethod && shippingCost != null && (
              <section>
                <h2 className="mb-4 text-lg font-semibold text-stone-900">Método de envío</h2>
                <div className="rounded-lg border-2 border-stone-900 bg-white px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold uppercase tracking-wide text-stone-900">
                        {shippingMethod}
                      </p>
                      {shippingNote && (
                        <p className="mt-1 text-xs leading-relaxed text-stone-500">{shippingNote}</p>
                      )}
                    </div>
                    <p className="shrink-0 text-sm font-semibold tabular-nums text-stone-900">
                      S/ {shippingCost.toFixed(2)}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Pago — pasarela externa (sin formulario de tarjeta en sitio) */}
            <section className="border-t border-stone-200 pt-8">
              <h2 className="text-lg font-semibold text-stone-900">Pago</h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-500">
                <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Todas las transacciones son seguras y están encriptadas.
              </p>

              <div className="mt-5 rounded-lg border border-stone-200 bg-white p-4 sm:p-5">
                <p className="text-sm font-medium text-stone-900">
                  Tarjeta, Yape y billeteras
                </p>
                <p className="mt-1 text-xs leading-relaxed text-stone-500">
                  Al pulsar el botón se abre la pasarela de pago segura. El pedido se confirma
                  cuando Culqi aprueba el pago.
                </p>
                <CulqiCheckoutButton
                  onPrepare={prepareCulqi}
                  onToken={async (tokenId, session) => {
                    try {
                      await chargeCulqi(tokenId, session)
                    } catch (e) {
                      setError(e instanceof Error ? e.message : "Error al pagar")
                    }
                  }}
                  disabled={!canPay || !hasCulqiPublicKey}
                >
                  {({ pay, loading: culqiLoading, ready }) => (
                    <button
                      type="button"
                      className="mt-5 flex h-12 w-full items-center justify-center rounded-md bg-stone-900 text-sm font-semibold text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!canPay || culqiLoading || !ready || !hasCulqiPublicKey}
                      onClick={pay}
                    >
                      {culqiLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                          Procesando…
                        </>
                      ) : (
                        "Pagar ahora"
                      )}
                    </button>
                  )}
                </CulqiCheckoutButton>
                {!hasCulqiPublicKey && (
                  <p className="mt-2 text-xs text-amber-700">
                    Configura `NEXT_PUBLIC_CULQI_PUBLIC_KEY` para habilitar pagos.
                  </p>
                )}
              </div>

              <CheckoutPolicyModals />
            </section>
          </div>

          <CheckoutOrderSummary
            items={items}
            subtotal={subtotal}
            discountAmount={discountAmount}
            shippingCost={shippingCost}
            shippingMethod={shippingMethod}
            shippingNote={shippingNote}
          />
        </div>

        <p className="mt-10 text-center lg:hidden">
          <Link href="/catalogo" className="text-sm text-stone-600 hover:text-stone-900 hover:underline">
            ← Seguir comprando
          </Link>
        </p>
      </main>
    </div>
  )
}
