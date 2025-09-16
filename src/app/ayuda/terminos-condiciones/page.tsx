import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageCircle, Shield, FileText, Clock } from "lucide-react"

export default function TerminosCondicionesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8 md:py-16 mt-20">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <FileText className="w-4 h-4" />
              Documento Legal
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Términos y Condiciones
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Conoce nuestros términos de servicio y políticas que rigen el uso de nuestra plataforma
            </p>
            <div className="flex items-center justify-center gap-4 mt-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Última actualización: Diciembre 2024
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Protegido por ley peruana
              </div>
            </div>
          </div>

          {/* Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Table of Contents - Left Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Índice
                </h2>
                <div className="space-y-2">
                  {[
                    "Información de la Empresa",
                    "Productos y Servicios", 
                    "Proceso de Compra",
                    "Métodos de Pago",
                    "Política de Devoluciones",
                    "Privacidad y Protección de Datos",
                    "Limitación de Responsabilidad",
                    "Modificaciones y Ley Aplicable"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">
                      <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                      {item}
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Terms Content - Right Side */}
            <div className="lg:col-span-3">

              {/* Terms Content */}
              <div className="space-y-12">
                {/* Introduction */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Introducción</h2>
                  <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                    <p className="mb-4">
                      Al acceder y utilizar este sitio web, usted acepta estar sujeto a estos términos y condiciones de uso. 
                      Estos términos constituyen un acuerdo legal entre usted y Excusas Jeans. Si no está de acuerdo con 
                      alguna parte de estos términos, no debe utilizar nuestros servicios.
                    </p>
                    <p className="mb-4">
                      El uso de nuestro sitio web implica la aceptación plena y sin reservas de estos términos y condiciones. 
                      Nos reservamos el derecho de modificar estos términos en cualquier momento, y el uso continuado del 
                      sitio web después de dichas modificaciones constituirá su aceptación de los términos modificados.
                    </p>
                  </div>
                </div>

                {/* Company Information */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Información de la Empresa</h2>
                  <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                    <p className="mb-4">
                      <strong>Razón Social:</strong> Excusas Jeans<br/>
                      <strong>RUC:</strong> [Número de RUC]<br/>
                      <strong>Dirección:</strong> [Dirección completa]<br/>
                      <strong>Teléfono:</strong> +51 934 762 253<br/>
                      <strong>Email:</strong> info@excusasjeans.com<br/>
                      <strong>WhatsApp:</strong> +51 934 762 253
                    </p>
                    <p className="mb-4">
                      Excusas Jeans es una empresa peruana dedicada a la comercialización de prendas de vestir, 
                      especializada en jeans y ropa casual de alta calidad. Nuestra empresa opera bajo las leyes 
                      de la República del Perú y cumple con todas las regulaciones comerciales aplicables.
                    </p>
                  </div>
                </div>

                {/* Products and Services */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Productos y Servicios</h2>
                  <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                    <p className="mb-4">
                      <strong>Política de Precios:</strong> Nos reservamos el derecho de modificar precios sin previo aviso. 
                      Los precios mostrados en el sitio web incluyen IGV cuando corresponda. Las imágenes de productos 
                      son ilustrativas y pueden variar ligeramente del producto final debido a diferencias en monitores 
                      y procesos de impresión.
                    </p>
                    <p className="mb-4">
                      <strong>Disponibilidad:</strong> La disponibilidad de productos está sujeta a stock. En caso de 
                      agotamiento de inventario, nos comprometemos a informar al cliente y ofrecer alternativas similares 
                      cuando sea posible. Ofrecemos garantía de calidad en todos nuestros productos y nos comprometemos 
                      a entregar productos que cumplan con nuestros estándares de calidad.
                    </p>
                    <p className="mb-4">
                      <strong>Especificaciones:</strong> Las especificaciones técnicas, medidas y características de los 
                      productos se basan en información proporcionada por nuestros proveedores. Nos esforzamos por 
                      mantener esta información actualizada y precisa, pero no garantizamos la exactitud absoluta de 
                      todas las especificaciones.
                    </p>
                  </div>
                </div>

                {/* Purchase Process */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Proceso de Compra</h2>
                  <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                    <p className="mb-4">
                      <strong>Selección de Productos:</strong> Los clientes pueden navegar por nuestro catálogo, 
                      seleccionar productos, elegir tallas y colores disponibles, y agregar productos al carrito 
                      de compras. Es responsabilidad del cliente verificar la disponibilidad antes de proceder 
                      con la compra.
                    </p>
                    <p className="mb-4">
                      <strong>Proceso de Checkout:</strong> Una vez que el cliente ha agregado productos al carrito, 
                      debe proporcionar información de envío completa y precisa, incluyendo dirección, distrito, 
                      provincia y datos de contacto. La información incorrecta puede resultar en retrasos en la entrega.
                    </p>
                    <p className="mb-4">
                      <strong>Confirmación de Pedido:</strong> Después de completar el proceso de pago, el cliente 
                      recibirá una confirmación por email con los detalles del pedido. Esta confirmación incluye 
                      número de pedido, productos ordenados, total pagado y información de envío.
                    </p>
                    <p className="mb-4">
                      <strong>Procesamiento y Envío:</strong> Los pedidos se procesan dentro de 1-2 días hábiles. 
                      El tiempo de entrega varía según la ubicación del destinatario y el método de envío seleccionado. 
                      Proporcionamos números de seguimiento cuando están disponibles.
                    </p>
                  </div>
                </div>

                {/* Payment Methods */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Métodos de Pago</h2>
                  <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                    <p className="mb-4">
                      <strong>Tarjetas de Crédito y Débito:</strong> Aceptamos Visa, Mastercard y American Express. 
                      Todas las transacciones con tarjeta son procesadas de forma segura a través de pasarelas de 
                      pago certificadas. Los datos de las tarjetas son encriptados y no se almacenan en nuestros servidores.
                    </p>
                    <p className="mb-4">
                      <strong>Transferencias Bancarias:</strong> Aceptamos transferencias bancarias desde cuentas 
                      peruanas. El cliente debe enviar el comprobante de transferencia por WhatsApp o email para 
                      confirmar el pago. Los pedidos se procesan una vez confirmado el pago.
                    </p>
                    <p className="mb-4">
                      <strong>Pago Contra Entrega:</strong> Disponible únicamente para envíos dentro de Lima Metropolitana. 
                      El cliente paga en efectivo al momento de recibir el producto. Este método tiene un costo 
                      adicional por el servicio de cobranza.
                    </p>
                    <p className="mb-4">
                      <strong>Pago en Tienda:</strong> Los clientes pueden realizar pedidos online y pagar en 
                      efectivo en nuestra tienda física. El producto debe ser retirado dentro de los 7 días 
                      hábiles siguientes al pago.
                    </p>
                  </div>
                </div>

                {/* Returns Policy */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Política de Devoluciones</h2>
                  <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                    <p className="mb-4">
                      <strong>Período de Devolución:</strong> Aceptamos cambios y devoluciones dentro de los 7 días 
                      calendario desde la fecha de compra. Este período comienza a contar desde el día de la entrega 
                      del producto al cliente.
                    </p>
                    <p className="mb-4">
                      <strong>Condiciones del Producto:</strong> El producto debe estar en perfecto estado, sin señales 
                      de uso, lavado o deterioro. Las etiquetas originales deben estar intactas y el producto debe 
                      conservar su empaque original. Es fundamental que el ojal de la prenda no haya sido abierto, 
                      ya que esto indica que el producto ha sido usado.
                    </p>
                    <p className="mb-4">
                      <strong>Documentación Requerida:</strong> Para procesar una devolución, el cliente debe presentar 
                      el recibo de compra original, la confirmación de pedido por email, y el producto en las 
                      condiciones especificadas anteriormente.
                    </p>
                    <p className="mb-4">
                      <strong>Proceso de Devolución:</strong> Para iniciar una devolución, el cliente debe contactar 
                      a nuestro servicio al cliente por WhatsApp (+51 934 762 253) proporcionando el número de pedido 
                      y las razones de la devolución. Nuestro equipo evaluará la solicitud y coordinará el proceso 
                      de devolución.
                    </p>
                    <p className="mb-4">
                      <strong>Reembolsos:</strong> Los reembolsos se procesan dentro de 5-10 días hábiles después 
                      de recibir y verificar el producto devuelto. El reembolso se realizará utilizando el mismo 
                      método de pago utilizado en la compra original.
                    </p>
                    <p className="mb-4">
                      <strong>Costos de Devolución:</strong> Los costos de envío para devoluciones corren por cuenta 
                      del cliente, a menos que la devolución sea por defecto del producto o error de nuestra parte.
                    </p>
                  </div>
                </div>

                {/* Privacy Policy */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Privacidad y Protección de Datos</h2>
                  <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                    <p className="mb-4">
                      <strong>Cumplimiento Legal:</strong> Respetamos tu privacidad y protegemos tus datos personales 
                      de acuerdo con la Ley de Protección de Datos Personales del Perú (Ley N° 29733) y su Reglamento. 
                      Implementamos medidas técnicas y organizativas apropiadas para proteger la información personal.
                    </p>
                    <p className="mb-4">
                      <strong>Recopilación de Datos:</strong> Recopilamos información personal cuando realizas una 
                      compra, te registras en nuestro sitio web, te suscribes a nuestro boletín, o nos contactas 
                      directamente. Esta información puede incluir nombre, dirección, número de teléfono, dirección 
                      de email, información de pago y preferencias de compra.
                    </p>
                    <p className="mb-4">
                      <strong>Uso de la Información:</strong> Utilizamos tu información personal para procesar pedidos, 
                      mejorar nuestros servicios, comunicarnos contigo sobre productos y promociones, y cumplir con 
                      obligaciones legales. No vendemos, alquilamos ni compartimos tu información personal con terceros 
                      sin tu consentimiento explícito.
                    </p>
                    <p className="mb-4">
                      <strong>Seguridad:</strong> Implementamos medidas de seguridad técnicas y organizativas para 
                      proteger tu información personal contra acceso no autorizado, alteración, divulgación o destrucción. 
                      Utilizamos encriptación SSL para proteger las transacciones y datos sensibles.
                    </p>
                    <p className="mb-4">
                      <strong>Tus Derechos:</strong> Tienes derecho a acceder, rectificar, cancelar u oponerte al 
                      tratamiento de tus datos personales. Puedes ejercer estos derechos contactándonos por email 
                      o WhatsApp con tu solicitud específica.
                    </p>
                  </div>
                </div>

                {/* Legal Information */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Limitación de Responsabilidad</h2>
                  <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                    <p className="mb-4">
                      Excusas Jeans no se hace responsable por daños indirectos, incidentales, especiales, consecuenciales 
                      o punitivos, incluyendo pero no limitado a pérdida de beneficios, pérdida de datos, interrupciones 
                      del negocio, o cualquier otra pérdida comercial que pueda resultar del uso de nuestros productos o servicios.
                    </p>
                    <p className="mb-4">
                      Nuestra responsabilidad total hacia ti por cualquier reclamo relacionado con estos términos y 
                      condiciones o el uso de nuestros servicios no excederá el monto que hayas pagado por los productos 
                      o servicios que dieron lugar al reclamo.
                    </p>
                  </div>
                </div>

                {/* Modifications and Applicable Law */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Modificaciones y Ley Aplicable</h2>
                  <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                    <p className="mb-4">
                      <strong>Modificaciones:</strong> Nos reservamos el derecho de modificar estos términos y condiciones 
                      en cualquier momento sin previo aviso. Las modificaciones entrarán en vigor inmediatamente después 
                      de su publicación en el sitio web. Es responsabilidad del usuario revisar periódicamente estos 
                      términos para estar informado de cualquier cambio.
                    </p>
                    <p className="mb-4">
                      <strong>Ley Aplicable:</strong> Estos términos y condiciones se rigen por las leyes de la 
                      República del Perú. Cualquier disputa, controversia o reclamación que surja de o esté relacionada 
                      con estos términos será resuelta exclusivamente en los tribunales competentes de Lima, Perú.
                    </p>
                    <p className="mb-4">
                      <strong>Disposiciones Generales:</strong> Si alguna disposición de estos términos es considerada 
                      inválida o inaplicable, las disposiciones restantes permanecerán en pleno vigor y efecto. 
                      La falta de ejercicio de cualquier derecho bajo estos términos no constituirá una renuncia 
                      a dicho derecho.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-16">
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                ¿Tienes preguntas sobre estos términos?
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Nuestro equipo está disponible para aclarar cualquier duda sobre nuestros términos y condiciones. 
                Contáctanos por WhatsApp y te responderemos a la brevedad.
              </p>
              <Button 
                asChild
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
              >
                <a 
                  href="https://wa.me/51934762253" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contactar por WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
