import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { WHATSAPP_NUMBER_DISPLAY, WHATSAPP_URL } from "@/lib/site"

export default function PoliticaCambiosDevolucionesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-14 mt-20">
        <article className="max-w-3xl mx-auto text-gray-700 leading-relaxed">
          <header className="mb-10 border-b border-gray-200 pb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Política de cambios y devoluciones
            </h1>
            <p className="text-gray-600">
              Aplica a compras realizadas en excusasjeans.com con pago mediante Culqi.
            </p>
          </header>

          <div className="space-y-8 text-[15px] md:text-base">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Cambios por talla</h2>
              <p className="mb-3">
                Aceptamos <strong>cambios únicamente por talla</strong>, no por modelo ni color,
                dentro de los <strong>7 días calendario</strong> posteriores a la entrega, sujeto a
                stock disponible.
              </p>
              <p className="mb-3">La prenda debe cumplir todas estas condiciones:</p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>Limpia y sin señales de uso</li>
                <li>Con etiquetas originales</li>
                <li>Ojal cerrado (sin abrir)</li>
                <li>Sin olor a perfume, humo u otros</li>
              </ul>
              <p>
                El cliente asume el costo del envío para devolver la prenda y para recibir la nueva
                talla.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Devoluciones</h2>
              <p>
                No realizamos devoluciones de dinero salvo falla de fabricación comprobada o error
                nuestro en el pedido enviado. En esos casos, contáctanos por WhatsApp con fotos y tu
                número de pedido para evaluar el caso.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Provincia y envíos</h2>
              <p>
                En provincia el envío es por Shalom; el flete de la agencia no está incluido en el
                pago online. Los cambios siguen las mismas reglas; el cliente coordina el envío de
                retorno.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Cómo solicitar un cambio</h2>
              <p className="mb-3">
                Escríbenos por WhatsApp al{" "}
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-700 hover:underline font-medium"
                >
                  {WHATSAPP_NUMBER_DISPLAY}
                </a>{" "}
                indicando tu número de pedido y la talla que necesitas.
              </p>
              <p>
                Si no estás conforme con la atención recibida, puedes usar nuestro{" "}
                <Link href="/ayuda/libro-reclamaciones" className="text-green-700 hover:underline">
                  Libro de reclamaciones
                </Link>
                .
              </p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}
