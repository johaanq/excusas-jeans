"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { WHATSAPP_URL } from "@/lib/site"

export default function PreguntasFrecuentesPage() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index]
    )
  }

  const faqs = [
    {
      question: "¿Cuáles son los métodos de pago en la tienda online?",
      answer:
        "En la web pagas con Culqi: tarjetas de crédito o débito, Yape y billeteras que aparezcan en el checkout. No aceptamos efectivo ni contraentrega en línea. En tiendas físicas el pago es en el local, según cada punto de venta.",
    },
    {
      question: "¿Cuánto tiempo demora el envío?",
      answer:
        "Los plazos pueden variar según stock y transporte. En Lima coordinamos la entrega tras confirmar el pago; a provincia el tiempo depende de la ruta y la agencia. Te avisamos al confirmar tu pedido.",
    },
    {
      question: "¿Hacen envíos a todo el Perú?",
      answer:
        "Sí, enviamos a todo el Perú. En Lima: S/ 15 (metropolitana) o S/ 20 (departamento) según tu distrito. En provincia: S/ 10 hasta agencia Shalom en el checkout; el flete al recoger lo pagas en la agencia. Si en tu zona no hay cobertura, escríbenos.",
    },
    {
      question: "¿Cómo puedo hacer seguimiento a mi pedido?",
      answer:
        "Al despachar te enviamos comprobante o guía de envío. Con ese documento puedes hacer seguimiento en la web de la empresa de transporte. Al comprar también confirmamos contigo los datos del pedido.",
    },
    {
      question: "¿Qué tallas tienen disponibles?",
      answer:
        "Revisa las tallas indicadas en cada producto del catálogo. Si tienes duda, consúltanos antes de comprar.",
    },
    {
      question: "¿Puedo cambiar o devolver un producto?",
      answer:
        "Solo cambios por talla (no por modelo ni color), hasta 7 días después de la entrega y según stock. La prenda debe llegar limpia, con etiqueta y sin señales de uso. El envío del cambio lo cubre el cliente. Escríbenos con tu número de pedido.",
    },
    {
      question: "¿Cómo puedo conocer las medidas de un producto?",
      answer:
        "En la ficha de cada producto hay fotos de medidas cuando las tenemos. Para elegir talla, también podemos orientarte por mensaje.",
    },
    {
      question: "¿Ofrecen descuentos por compras al por mayor?",
      answer:
        "Sí. Para cotización y disponibilidad, contáctanos con lo que necesitas.",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 py-8 md:py-16 mt-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Preguntas Frecuentes
          </h1>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                  <div className="flex-shrink-0">
                    {openItems.includes(index) ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </button>

                {openItems.includes(index) && (
                  <div className="px-6 pb-4">
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">¿No encontraste la respuesta que buscabas?</p>
            <a
              href={WHATSAPP_URL}
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
