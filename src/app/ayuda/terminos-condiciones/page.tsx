import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { WHATSAPP_NUMBER_DISPLAY, WHATSAPP_URL } from "@/lib/site"

export default function TerminosCondicionesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 py-8 md:py-14 mt-20">
        <article className="max-w-3xl mx-auto text-gray-700 leading-relaxed">
          <header className="mb-10 border-b border-gray-200 pb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Términos y condiciones
            </h1>
            <p className="text-gray-600">
              Condiciones de uso del sitio web y de las compras en línea de Excusas Jeans.
            </p>
          </header>

          <div className="space-y-10 text-[15px] md:text-base">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Aceptación</h2>
              <p>
                Al usar excusasjeans.com y completar una compra, aceptas estos términos. Podemos
                actualizarlos publicando una nueva versión en esta página.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Quiénes somos</h2>
              <p className="mb-3">
                Excusas Jeans comercializa jeans y ropa casual en Perú, con venta en línea y
                tiendas físicas. Atención al cliente por WhatsApp:
              </p>
              <p>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-700 hover:underline font-medium"
                >
                  {WHATSAPP_NUMBER_DISPLAY}
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Tienda online y pagos</h2>
              <p className="mb-3">
                Las compras en la web se pagan mediante Culqi (tarjeta, Yape y billeteras
                habilitadas). No se acepta efectivo ni pago contra entrega en el checkout online. Los precios pueden cambiar sin aviso;
                incluyen IGV cuando corresponda.
              </p>
              <p>
                Las fotos son referenciales. La disponibilidad depende del stock al momento de
                procesar el pedido.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Envíos</h2>
              <p className="mb-3">
                <strong>Lima:</strong> delivery a domicilio. Lima Metropolitana: S/ 15; Lima
                Departamento: S/ 20 (según distrito en el checkout). Se paga junto con el pedido.
                Los plazos de entrega son estimados y pueden variar.
              </p>
              <p className="mb-3">
                <strong>Provincia:</strong> envíos por Shalom. El pago online incluye S/ 10 por llevar
                el pedido hasta la agencia; el flete en destino lo pagas al recoger. Si no hay
                agencia Shalom en tu localidad, contáctanos por
                WhatsApp para coordinar otra empresa de transporte.
              </p>
              <p>
                Tras un pago exitoso, te contactamos por WhatsApp para confirmar datos y, al
                despachar, enviamos boleta o guía para seguimiento con el courier (Shalom, Flores u
                otro acordado).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Cambios por talla</h2>
              <p className="mb-3">
                Solo se aceptan <strong>cambios por talla</strong>, no por modelo ni color, dentro
                de los 7 días calendario posteriores a la entrega, sujeto a stock.
              </p>
              <p className="mb-3">
                La prenda debe estar limpia, con etiquetas, ojal sin abrir y sin olor a uso o
                perfume. El cliente asume el costo del flete para enviar la prenda y para recibir la
                nueva talla.
              </p>
              <p>
                Detalle completo en nuestra{" "}
                <a href="/ayuda/politica-cambios-devoluciones" className="text-green-700 hover:underline">
                  política de cambios
                </a>
                . Para solicitar un cambio, escribe por WhatsApp al {WHATSAPP_NUMBER_DISPLAY} con tu
                número de pedido.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Tiendas físicas</h2>
              <p>
                En locales presenciales aplican condiciones de pago y cambios informadas en tienda.
                El pago con tarjeta en la web no sustituye las políticas del punto de venta físico.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Datos personales</h2>
              <p>
                Usamos tus datos (nombre, teléfono, dirección, historial de pedidos y cuenta) para
                procesar compras y contactarte, conforme a la Ley N.° 29733. Puedes solicitar
                acceso o rectificación por WhatsApp.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Ley aplicable</h2>
              <p>
                Estos términos se rigen por la legislación peruana. Controversias ante tribunales
                competentes de Lima, sin perjuicio de derechos del consumidor.
              </p>
            </section>
          </div>

          <footer className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-600 mb-4">Consultas sobre estos términos:</p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              Escribir por WhatsApp
            </a>
          </footer>
        </article>
      </main>

      <Footer />
    </div>
  )
}
