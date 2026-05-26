import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Image from "next/image"
import Link from "next/link"
import { Clock, Instagram, Mail, MapPin, MessageCircle, type LucideIcon } from "lucide-react"
import {
  WHATSAPP_NUMBER_DISPLAY,
  WHATSAPP_URL,
  getContactEmail,
  INSTAGRAM_URL,
  STORE_LOCATIONS,
} from "@/lib/site"

const HOURS = [
  { days: "Lunes a viernes", time: "9:00 a.m. – 7:00 p.m." },
  { days: "Sábados", time: "9:00 a.m. – 5:00 p.m." },
  { days: "Domingos", time: "Cerrado" },
]

function ContactRow({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-4 py-5 border-b border-gray-100 last:border-0">
      <Icon className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" strokeWidth={1.5} />
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">{label}</p>
        <div className="text-gray-900">{children}</div>
      </div>
    </div>
  )
}

function StoreBlock({
  store,
  isLast,
}: {
  store: (typeof STORE_LOCATIONS)[number]
  isLast: boolean
}) {
  return (
    <div
      className={`grid grid-cols-[auto_1fr] gap-x-5 gap-y-1 py-6 ${!isLast ? "border-b border-gray-100" : ""}`}
    >
      <span className="text-2xl font-light text-gray-300 tabular-nums leading-none pt-0.5">
        {store.id.padStart(2, "0")}
      </span>
      <div>
        <p className="text-sm font-medium text-gray-900 tracking-wide uppercase mb-3">
          {store.label}
        </p>
        <dl className="space-y-2 text-sm">
          <div className="grid grid-cols-[5.5rem_1fr] gap-x-3 gap-y-0.5">
            <dt className="text-gray-400">Dirección</dt>
            <dd className="text-gray-800">{store.street}</dd>
          </div>
          <div className="grid grid-cols-[5.5rem_1fr] gap-x-3">
            <dt className="text-gray-400">Galería</dt>
            <dd className="text-gray-800">{store.gallery}</dd>
          </div>
          <div className="grid grid-cols-[5.5rem_1fr] gap-x-3">
            <dt className="text-gray-400">Puesto</dt>
            <dd className="text-gray-800">
              {store.unit} · {store.floor}
            </dd>
          </div>
          <div className="grid grid-cols-[5.5rem_1fr] gap-x-3 pt-1">
            <dt className="text-gray-400">Ciudad</dt>
            <dd className="text-gray-500">{store.district}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

export default function ContactoPage() {
  const email = getContactEmail()

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      <main className="mt-20">
        <section className="border-b border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-12 md:py-16 max-w-5xl">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-3">
              Atención al cliente
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight">
              Contacto
            </h1>
            <p className="mt-4 text-gray-600 max-w-2xl leading-relaxed">
              Venta online con envíos a todo el Perú y tres locales en Gamarra. Escríbenos por
              WhatsApp para pedidos, tallas o seguimiento de tu compra.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 md:py-16 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
            <div className="lg:col-span-5">
              <h2 className="text-sm font-medium text-gray-900 mb-1">Canales de contacto</h2>
              <p className="text-sm text-gray-500 mb-6">Respuesta habitual el mismo día hábil.</p>

              <div className="bg-white border border-gray-200 px-5">
                <ContactRow icon={MessageCircle} label="WhatsApp">
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gray-600 transition-colors"
                  >
                    {WHATSAPP_NUMBER_DISPLAY}
                  </a>
                </ContactRow>

                <ContactRow icon={Mail} label="Correo">
                  <a
                    href={`mailto:${email}`}
                    className="hover:text-gray-600 transition-colors break-all"
                  >
                    {email}
                  </a>
                </ContactRow>

                <ContactRow icon={Clock} label="Horario">
                  <ul className="space-y-1.5 text-sm text-gray-700">
                    {HOURS.map((h) => (
                      <li key={h.days} className="flex justify-between gap-4">
                        <span className="text-gray-500">{h.days}</span>
                        <span>{h.time}</span>
                      </li>
                    ))}
                  </ul>
                </ContactRow>

                <ContactRow icon={Instagram} label="Instagram">
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gray-600 transition-colors"
                  >
                    @excusas.jeans
                  </a>
                </ContactRow>
              </div>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center justify-center w-full px-6 py-3 bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Escribir por WhatsApp
              </a>
            </div>

            <div className="lg:col-span-7 space-y-8">
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 border border-gray-200">
                <Image
                  src="/contacto-denim.png"
                  alt="Excusas Jeans — We Love Denim"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  priority
                />
              </div>

              <div>
                <div className="flex items-end justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-sm font-medium text-gray-900">Locales en Gamarra</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      La Victoria, Lima · prueba y compra en tienda
                    </p>
                  </div>
                  <MapPin className="h-5 w-5 text-gray-300 shrink-0 hidden sm:block" strokeWidth={1.5} />
                </div>

                <div className="bg-white border border-gray-200 px-5 md:px-6">
                  {STORE_LOCATIONS.map((store, i) => (
                    <StoreBlock
                      key={store.id}
                      store={store}
                      isLast={i === STORE_LOCATIONS.length - 1}
                    />
                  ))}
                </div>

                <p className="mt-6 text-sm text-gray-500 leading-relaxed">
                  Compras web con pago Culqi. Envío a domicilio en Lima o por Shalom en provincia.{" "}
                  <Link href="/catalogo" className="text-gray-900 underline underline-offset-2">
                    Ver catálogo
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
