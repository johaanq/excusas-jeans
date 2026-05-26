"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"
import { WHATSAPP_URL, WHATSAPP_NUMBER_DISPLAY } from "@/lib/site"
import { CheckCircle, Clock, Loader2 } from "lucide-react"

function ExitoContent() {
  const searchParams = useSearchParams()
  const { clearCart } = useCart()
  const [numero, setNumero] = useState<string | null>(null)
  const [tipoEnvio, setTipoEnvio] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const pedidoParam = searchParams.get("pedido")
    if (!pedidoParam) {
      setError("No se recibió el número de pedido. Si ya pagaste, escríbenos por WhatsApp.")
      return
    }

    fetch(`/api/checkout/confirm?numero=${encodeURIComponent(pedidoParam)}`)
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setNumero(data.numero_pedido)
        setTipoEnvio(data.tipo_envio)
        setPending(Boolean(data.pending))
        if (!data.pending) clearCart()
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "No se pudo confirmar el pedido")
      })
  }, [searchParams, clearCart])

  return (
    <main className="container mx-auto px-4 py-16 mt-20 max-w-lg text-center">
      {error ? (
        <>
          <p className="text-red-600 mb-4">{error}</p>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </Button>
        </>
      ) : !numero ? (
        <Loader2 className="h-10 w-10 animate-spin mx-auto text-gray-400" />
      ) : pending ? (
        <>
          <Clock className="h-14 w-14 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pago en proceso</h1>
          <p className="text-gray-600 mb-4">
            Pedido <strong>{numero}</strong>. Algunos medios pueden tardar unos minutos en
            confirmarse. Te avisaremos por WhatsApp.
          </p>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              Escribir por WhatsApp
            </a>
          </Button>
        </>
      ) : (
        <>
          <CheckCircle className="h-14 w-14 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Pago recibido!</h1>
          <p className="text-gray-600 mb-2">
            Tu pedido <strong>{numero}</strong> fue registrado correctamente.
          </p>
          {tipoEnvio === "provincia" && (
            <p className="text-sm text-gray-600 mb-4">
              Envío por Shalom: el flete lo pagas en la agencia al recoger. Te contactaremos por
              WhatsApp con los datos de tu boleta y seguimiento.
            </p>
          )}
          {tipoEnvio === "lima" && (
            <p className="text-sm text-gray-600 mb-4">
              Coordinaremos el delivery en Lima. Te escribiremos por WhatsApp (
              {WHATSAPP_NUMBER_DISPLAY}) para confirmar tu pedido.
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                Escribir por WhatsApp
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/catalogo">Seguir comprando</Link>
            </Button>
          </div>
        </>
      )}
    </main>
  )
}

export default function CheckoutExitoPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Suspense
        fallback={
          <div className="flex justify-center py-24 mt-20">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <ExitoContent />
      </Suspense>
      <Footer />
    </div>
  )
}
