import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function TerminosCondicionesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8 md:py-16 mt-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Términos y Condiciones
          </h1>
          
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
              <p className="mb-6">
                Al acceder y utilizar este sitio web, usted acepta estar sujeto a estos términos y condiciones. 
                Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios.
              </p>

              <p className="mb-6">
                <strong>Información de la Empresa:</strong> Excusas Jeans, con RUC [Número de RUC], 
                ubicada en [Dirección completa], teléfono +51 934 762 253, email info@excusasjeans.com.
              </p>

              <p className="mb-6">
                <strong>Productos y Servicios:</strong> Nos reservamos el derecho de modificar precios sin previo aviso. 
                Las imágenes de productos son ilustrativas y pueden variar ligeramente. La disponibilidad de productos 
                está sujeta a stock. Ofrecemos garantía de calidad en todos nuestros productos.
              </p>

              <p className="mb-6">
                <strong>Proceso de Compra:</strong> El proceso incluye selección de productos y agregado al carrito, 
                proceso de checkout con información de envío, selección de método de pago, confirmación de pedido, 
                y procesamiento y envío.
              </p>

              <p className="mb-6">
                <strong>Métodos de Pago:</strong> Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express), 
                transferencias bancarias, pago contra entrega (solo Lima), y pago en efectivo en tienda.
              </p>

              <p className="mb-6">
                <strong>Política de Devoluciones:</strong> Aceptamos cambios y devoluciones dentro de los 7 días calendario 
                desde la compra. El producto debe estar en perfecto estado, con etiquetas originales intactas, recibo de compra, 
                y no debe haber sido usado ni lavado. Para coordinar la devolución, contactar por WhatsApp.
              </p>

              <p className="mb-6">
                <strong>Privacidad y Protección de Datos:</strong> Respetamos tu privacidad y protegemos tus datos personales 
                de acuerdo con la Ley de Protección de Datos Personales del Perú. Solo utilizamos tu información para procesar 
                pedidos y mejorar nuestros servicios.
              </p>

              <p className="mb-6">
                <strong>Limitación de Responsabilidad:</strong> Excusas Jeans no se hace responsable por daños indirectos, 
                pérdida de beneficios o interrupciones del negocio que puedan resultar del uso de nuestros productos o servicios.
              </p>

              <p className="mb-6">
                <strong>Modificaciones:</strong> Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento. 
                Las modificaciones entrarán en vigor inmediatamente después de su publicación en el sitio web.
              </p>

              <p className="mb-6">
                <strong>Ley Aplicable:</strong> Estos términos y condiciones se rigen por las leyes de la República del Perú. 
                Cualquier disputa será resuelta en los tribunales competentes de Lima, Perú.
              </p>

              <p className="text-sm text-gray-500 mt-8">
                Última actualización: Diciembre 2024
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              ¿Tienes preguntas sobre estos términos?
            </p>
            <a 
              href="https://wa.me/51934762253" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Contactar por WhatsApp
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
