import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { LibroReclamacionesForm } from "@/components/ayuda/libro-reclamaciones-form"
import {
  getBusinessAddress,
  getContactEmail,
  WHATSAPP_NUMBER_DISPLAY,
  WHATSAPP_URL,
} from "@/lib/site"

export default function LibroReclamacionesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-14 mt-20">
        <article className="max-w-2xl mx-auto">
          <header className="mb-8 border-b border-gray-200 pb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Libro de reclamaciones
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              Conforme al Código de Protección y Defensa del Consumidor y normas de INDECOPI. El
              proveedor debe dar respuesta en un plazo máximo de 30 días calendario. Este formulario
              queda registrado en nuestros sistemas; no requiere enlaces externos.
            </p>
          </header>

          <section className="mb-8 rounded-lg border bg-gray-50 p-4 text-sm text-gray-700 space-y-1">
            <p>
              <strong>Razón social:</strong> Excusas Jeans
            </p>
            <p>
              <strong>Domicilio:</strong> {getBusinessAddress()}
            </p>
            <p>
              <strong>Teléfono:</strong>{" "}
              <a href={WHATSAPP_URL} className="text-green-700 hover:underline">
                {WHATSAPP_NUMBER_DISPLAY}
              </a>
            </p>
            <p>
              <strong>Correo:</strong>{" "}
              <a href={`mailto:${getContactEmail()}`} className="text-green-700 hover:underline">
                {getContactEmail()}
              </a>
            </p>
          </section>

          <LibroReclamacionesForm />
        </article>
      </main>
      <Footer />
    </div>
  )
}
