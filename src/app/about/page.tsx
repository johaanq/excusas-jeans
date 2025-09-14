import { Header } from "@/components/header"
import { Suspense, memo } from "react"
import { CheckCircle, Heart, Award, Users, Star } from "lucide-react"

// Componente memoizado para el hero
const HeroSection = memo(function HeroSection() {
  return (
  <section className="relative w-full pt-20 sm:pt-24 md:pt-28 pb-4 sm:pb-6 md:pb-8 flex items-center justify-center bg-gray-50">
    <div className="container mx-auto px-4 flex justify-center">
      <img 
        src="/aboutus-excusas.png" 
        alt="Sobre nosotros - Excusas Jeans" 
        className="max-w-xs sm:max-w-sm md:max-w-md w-full h-auto object-contain"
      />
    </div>
  </section>
  )
})

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={
        <div className="h-20 bg-white/95 backdrop-blur-md border-b border-gray-200 animate-pulse"></div>
      }>
        <Header />
      </Suspense>
      
      <HeroSection />

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Historia */}
          <section className="mb-8 sm:mb-12 md:mb-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-12 items-center">
              <div className="animate-fade-in-left">
                <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 lg:mb-6">Nuestra Historia</h2>
                <div className="space-y-2 sm:space-y-3 md:space-y-4">
                  <p className="text-gray-600 leading-relaxed text-xs sm:text-sm md:text-base">
                    Excusas Jeans nació de la pasión por crear jeans únicos que reflejen la personalidad de cada persona. 
                    Cada pieza está diseñada con amor y atención al detalle, combinando estilo urbano con comodidad.
                  </p>
                  <p className="text-gray-600 leading-relaxed text-xs sm:text-sm md:text-base">
                    Creemos que la moda debe ser accesible, sostenible y que te haga sentir increíble. 
                    Por eso trabajamos directamente con nuestros clientes a través de WhatsApp para ofrecer 
                    un servicio personalizado y cercano.
                  </p>
                  <p className="text-gray-600 leading-relaxed text-xs sm:text-sm md:text-base">
                    Desde nuestros inicios, nos hemos enfocado en crear productos de calidad que no solo se vean bien, 
                    sino que también reflejen nuestros valores de sostenibilidad y autenticidad.
                  </p>
                </div>
              </div>
              <div className="animate-fade-in-right">
                <div className="rounded-lg overflow-hidden shadow-lg">
                  <img 
                    src="/nuestrahistoria-excusas.png" 
                    alt="Nuestra historia - Excusas Jeans" 
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Valores */}
          <section className="mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center animate-fade-in-up">Nuestros Valores</h2>
            <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              {[
                {
                  icon: CheckCircle,
                  title: "Calidad Premium",
                  description: "Materiales de primera calidad que garantizan durabilidad y comodidad en cada par de jeans."
                },
                {
                  icon: Heart,
                  title: "Estilo Único",
                  description: "Diseños exclusivos que reflejan tu personalidad y estilo urbano, sin comprometer la comodidad."
                },
                {
                  icon: Award,
                  title: "Sostenibilidad",
                  description: "Comprometidos con prácticas sostenibles y respetuosas con el medio ambiente en cada proceso."
                }
              ].map((value, index) => (
                <div 
                  key={index}
                  className="text-center animate-fade-in-up"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                    <value.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <h3 className="text-xs sm:text-sm md:text-lg lg:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm md:text-base leading-tight sm:leading-normal">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Por qué elegirnos */}
          <section className="mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center animate-fade-in-up">
              ¿Por qué somos tu mejor opción en cuanto a jeans?
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              {[
                {
                  icon: Star,
                  number: "22+",
                  title: "Experiencia Comprobada",
                  description: "Más de 22 años de experiencia en el rubro textil nos respaldan. Conocemos cada detalle del proceso de fabricación y las últimas tendencias del mercado."
                },
                {
                  icon: Award,
                  title: "Tela Nacional Premium",
                  description: "Trabajamos exclusivamente con tela nacional de primera calidad, 100% algodón de Nuevo Mundo. Somos parte de la familia de ADN Perú, garantizando la mejor materia prima del mercado."
                },
                {
                  icon: Users,
                  title: "Calidad y Tendencia",
                  description: "Buena calidad, excelente acabado y lavados denim que siguen las últimas tendencias. Cada par de jeans es una pieza única que combina durabilidad con estilo moderno."
                }
              ].map((item, index) => (
                <div 
                  key={index}
                  className="text-center p-2 sm:p-3 md:p-4 lg:p-6 bg-gray-50 rounded-xl animate-fade-in-up"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                    {item.number ? (
                      <span className="text-white font-bold text-sm sm:text-base md:text-lg lg:text-xl">{item.number}</span>
                    ) : (
                      <item.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-white" />
                    )}
                  </div>
                  <h3 className="text-xs sm:text-sm md:text-lg lg:text-xl font-semibold text-gray-900 mb-1 sm:mb-2 md:mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-tight sm:leading-relaxed text-xs sm:text-sm md:text-base">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Estadísticas adicionales */}
          <section className="mb-8 sm:mb-12 md:mb-16">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-8">
              {[
                { number: "100%", label: "Algodón Premium" },
                { number: "22+", label: "Años de Experiencia" },
                { number: "24/7", label: "WhatsApp" },
                { number: "ADN", label: "Perú Premium" }
              ].map((stat, index) => (
                <div 
                  key={index}
                  className="text-center animate-fade-in-up"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">{stat.number}</div>
                  <div className="text-xs md:text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Contacto */}
          <section className="bg-gray-50 rounded-2xl p-4 sm:p-6 md:p-8 text-center animate-fade-in-up">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">¿Tienes alguna pregunta?</h2>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
              Estamos aquí para ayudarte. Contáctanos por WhatsApp y te responderemos al instante.
            </p>
            <a 
              href="https://wa.me/51934762253" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors text-sm sm:text-base"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              Contactar por WhatsApp
            </a>
          </section>
        </div>
      </main>
      
      <footer className="bg-gray-900 text-white mt-8 sm:mt-12 md:mt-16">
        <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
          <div className="border-t border-gray-700 mt-3 sm:mt-4 md:mt-6 pt-3 sm:pt-4 md:pt-6 text-center text-xs sm:text-sm text-gray-400">
            <p>&copy; 2024 Excusas Jeans. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
