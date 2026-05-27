import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowUpRight,
  Clock,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react"
import {
  WHATSAPP_NUMBER_DISPLAY,
  WHATSAPP_URL,
  getContactEmail,
  INSTAGRAM_URL,
  STORE_LOCATIONS,
} from "@/lib/site"
import { cn } from "@/lib/utils"

const CONTACT_HERO = "/contacto-hero.png"

const HOURS = [
  { days: "Lunes a sábado", time: "10:00 a.m. – 8:00 p.m." },
  { days: "Domingos", time: "10:00 a.m. – 5:00 p.m." },
]

function ContactCard({
  icon: Icon,
  label,
  href,
  external,
  children,
  className,
}: {
  icon: LucideIcon
  label: string
  href?: string
  external?: boolean
  children: React.ReactNode
  className?: string
}) {
  const inner = (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-stone-100 text-stone-600">
        <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="store-meta mb-0.5">{label}</p>
        <div className="store-label font-normal">{children}</div>
      </div>
      {href && <ArrowUpRight className="h-4 w-4 shrink-0 text-stone-400" aria-hidden />}
    </>
  )

  const boxClass = cn(
    "flex items-start gap-3 rounded-lg border border-stone-200 bg-white p-4 transition-colors",
    href && "hover:border-stone-300 hover:bg-stone-50/80",
    className
  )

  if (href) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={boxClass}
      >
        {inner}
      </a>
    )
  }

  return <div className={boxClass}>{inner}</div>
}

function StoreCard({ store }: { store: (typeof STORE_LOCATIONS)[number] }) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-stone-200 bg-white p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--store-denim-dark)]">
          Local {store.id.padStart(2, "0")}
        </span>
        <MapPin className="h-4 w-4 text-stone-300" strokeWidth={1.5} aria-hidden />
      </div>
      <h3 className="text-sm font-semibold text-stone-900 sm:text-base">{store.label}</h3>
      <dl className="mt-3 flex-1 space-y-2 text-sm text-stone-600">
        <div>
          <dt className="store-meta">Dirección</dt>
          <dd className="mt-0.5 text-stone-800">{store.street}</dd>
        </div>
        <div>
          <dt className="store-meta">Galería</dt>
          <dd className="mt-0.5">{store.gallery}</dd>
        </div>
        <div>
          <dt className="store-meta">Puesto</dt>
          <dd className="mt-0.5">
            {store.unit} · {store.floor}
          </dd>
        </div>
        <div>
          <dt className="store-meta">Distrito</dt>
          <dd className="mt-0.5">{store.district}</dd>
        </div>
      </dl>
    </article>
  )
}

export default function ContactoPage() {
  const email = getContactEmail()

  return (
    <div className="min-h-screen bg-[var(--store-bg)]">
      <Header />

      <main className="pb-12 pt-20 sm:pb-16 sm:pt-24 md:pt-28">
        <div className="store-container-wide">
          <header className="mb-8 md:mb-10">
            <p className="store-kicker">Atención al cliente</p>
            <h1 className="store-title mt-1">Contacto</h1>
            <p className="store-lead mt-2 max-w-2xl">
              Tienda online con envío a todo el Perú y tres locales en Gamarra. Escríbenos por
              WhatsApp para pedidos, tallas o seguimiento de tu compra.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start lg:gap-10">
            {/* Foto editorial — proporción vertical */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-lg bg-stone-200 shadow-sm lg:sticky lg:top-28 lg:max-w-none">
                <div className="relative aspect-[4/5] w-full sm:aspect-[3/4] lg:aspect-[4/5]">
                  <Image
                    src={CONTACT_HERO}
                    alt="Excusas Jeans — denim flare"
                    fill
                    className="object-cover object-[center_15%]"
                    sizes="(max-width: 1024px) 90vw, 40vw"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Canales */}
            <div className="space-y-4 lg:col-span-7">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col rounded-lg border border-[var(--store-denim-dark)] bg-[var(--store-denim-dark)] p-5 text-white sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-md bg-white/15">
                    <MessageCircle className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </span>
                  <ArrowUpRight
                    className="h-5 w-5 text-white/60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-white/75">
                  Respuesta habitual el mismo día hábil
                </p>
                <p className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">WhatsApp</p>
                <p className="mt-0.5 text-base font-medium text-white/90 sm:text-lg">
                  {WHATSAPP_NUMBER_DISPLAY}
                </p>
                <span className="store-btn-primary mt-5 !bg-white !text-[var(--store-denim-dark)] hover:!bg-stone-50">
                  Escribir por WhatsApp
                </span>
              </a>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ContactCard icon={Mail} label="Correo" href={`mailto:${email}`}>
                  <span className="break-all text-sm">{email}</span>
                </ContactCard>
                <ContactCard icon={Instagram} label="Instagram" href={INSTAGRAM_URL} external>
                  @excusas.jeans
                </ContactCard>
              </div>

              <ContactCard icon={Clock} label="Horario">
                <ul className="space-y-1.5">
                  {HOURS.map((h) => (
                    <li key={h.days} className="flex justify-between gap-4 text-sm text-stone-700">
                      <span className="text-stone-500">{h.days}</span>
                      <span className="tabular-nums">{h.time}</span>
                    </li>
                  ))}
                </ul>
              </ContactCard>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-sm">
                <Link
                  href="/catalogo"
                  className="inline-flex items-center gap-1.5 font-medium text-[var(--store-denim-dark)] hover:underline"
                >
                  <ShoppingBag className="h-4 w-4" aria-hidden />
                  Ver catálogo
                </Link>
                <Link
                  href="/ayuda/preguntas-frecuentes"
                  className="font-medium text-stone-600 hover:text-stone-900 hover:underline"
                >
                  Preguntas frecuentes
                </Link>
              </div>
            </div>
          </div>

          <section className="store-section mt-12 md:mt-16">
            <h2 className="text-lg font-semibold tracking-tight text-stone-900 sm:text-xl">
              Locales en Gamarra
            </h2>
            <p className="store-lead mt-1">
              La Victoria, Lima · prueba tallas y compra en tienda
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {STORE_LOCATIONS.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>

            <p className="mt-6 rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm leading-relaxed text-stone-600">
              Compras en la web con pago seguro. Envío a domicilio en Lima o por Shalom en provincia.
              ¿Primera vez?{" "}
              <Link
                href="/cuenta"
                className="font-medium text-[var(--store-denim-dark)] underline-offset-2 hover:underline"
              >
                Regístrate
              </Link>{" "}
              y obtén 5% en tu primera compra.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
