"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

export default function PreguntasFrecuentesPage() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    )
  }

  const faqs = [
    {
      question: "¿Cuáles son los métodos de pago disponibles?",
      answer: "Aceptamos pagos con tarjetas de crédito y débito (Visa, Mastercard, American Express), transferencias bancarias y pagos en efectivo contra entrega en Lima."
    },
    {
      question: "¿Cuánto tiempo demora el envío?",
      answer: "Los envíos dentro de Lima demoran entre 24-48 horas. Para provincias, el tiempo de entrega es de 3-5 días hábiles dependiendo de la ubicación."
    },
    {
      question: "¿Puedo cambiar o devolver un producto?",
      answer: "Sí, aceptamos cambios y devoluciones dentro de los 7 días posteriores a la compra. El producto debe estar en perfecto estado y con su etiqueta original."
    },
    {
      question: "¿Cómo puedo conocer las tallas disponibles?",
      answer: "Puedes consultar la guía de tallas en cada producto o contactarnos por WhatsApp para recibir asesoría personalizada sobre las medidas."
    },
    {
      question: "¿Hacen envíos a todo el Perú?",
      answer: "Sí, realizamos envíos a todo el territorio peruano. Los costos de envío varían según la ubicación y se calculan al momento de la compra."
    },
    {
      question: "¿Cómo puedo hacer seguimiento a mi pedido?",
      answer: "Una vez procesado tu pedido, recibirás un código de seguimiento por WhatsApp o email que te permitirá rastrear tu envío en tiempo real."
    },
    {
      question: "¿Qué tallas tienen disponibles?",
      answer: "Tenemos tallas desde XS hasta XXL en la mayoría de nuestros productos. Cada producto tiene su propia guía de tallas que puedes consultar en la descripción."
    },
    {
      question: "¿Ofrecen descuentos por compras al por mayor?",
      answer: "Sí, ofrecemos descuentos especiales para compras al por mayor. Contacta con nosotros por WhatsApp para conocer nuestras condiciones y precios especiales."
    }
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
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
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
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              ¿No encontraste la respuesta que buscabas?
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
