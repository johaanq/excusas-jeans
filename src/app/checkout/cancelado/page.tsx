import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"

export default function CheckoutCanceladoPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-16 mt-20 max-w-lg text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pago cancelado</h1>
        <p className="text-gray-600 mb-6">
          No se realizó el cobro. Puedes volver al checkout cuando quieras.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/checkout">Volver al checkout</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/catalogo">Ver catálogo</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
