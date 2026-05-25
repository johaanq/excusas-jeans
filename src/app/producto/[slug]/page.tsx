import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Header } from "@/components/header"
import { ProductDetail } from "@/components/product-detail"
import { JsonLd } from "@/components/seo/json-ld"
import { hasPublicInsforgeKey } from "@/lib/insforge"
import { supabase } from "@/lib/supabase"
import { buildPageMetadata, buildProductJsonLd } from "@/lib/seo"
import { SITE_NAME } from "@/lib/site"
import type { Producto, SupabaseColor, SupabaseFotoColor, SupabaseTalla, SupabaseFotoMedida } from "@/data/productos"

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

async function getProductoBySlug(slug: string): Promise<Producto | null> {
  if (!hasPublicInsforgeKey()) {
    return null
  }

  try {
    const { data: productoData, error: productoError } = await supabase
      .from('productos')
      .select(`
        id,
        nombre,
        slug,
        descripcion,
        precio,
        precio_mayor,
        estado,
        foto_principal,
        created_at,
        colores (
          id,
          producto_id,
          nombre,
          hex,
          created_at,
          fotos_color (
            id,
            color_id,
            url,
            created_at
          )
        ),
        tallas (
          id,
          producto_id,
          talla,
          en_stock,
          created_at
        ),
        fotos_medidas (
          id,
          producto_id,
          url,
          created_at
        )
      `)
      .eq('slug', slug)
      .eq('estado', 'activo')
      .single()

    if (productoError) throw productoError

    if (!productoData) return null

    // Transformar los datos al formato esperado
    const productoFormateado: Producto = {
      id: productoData.id,
      nombre: productoData.nombre,
      slug: productoData.slug,
      descripcion: productoData.descripcion || '',
      precio: productoData.precio,
      precio_mayor: productoData.precio_mayor,
      estado: productoData.estado,
      foto_principal: productoData.foto_principal || '',
      created_at: productoData.created_at,
      colores: productoData.colores?.map((color: SupabaseColor) => ({
        id: color.id,
        producto_id: color.producto_id,
        nombre: color.nombre,
        hex: color.hex,
        fotos: color.fotos_color?.map((foto: SupabaseFotoColor) => ({
          id: foto.id,
          color_id: foto.color_id,
          url: foto.url,
          created_at: foto.created_at
        })) || [],
        created_at: color.created_at
      })) || [],
      tallas: productoData.tallas?.map((talla: SupabaseTalla) => ({
        id: talla.id,
        producto_id: talla.producto_id,
        talla: talla.talla,
        en_stock: talla.en_stock,
        created_at: talla.created_at
      })) || [],
      fotos_medidas: productoData.fotos_medidas?.map((foto: SupabaseFotoMedida) => ({
        id: foto.id,
        producto_id: foto.producto_id,
        url: foto.url,
        created_at: foto.created_at
      })) || []
    }

    return productoFormateado
  } catch (err) {
    console.error('Error fetching producto by slug:', err)
    return null
  }
}

async function getProductos(): Promise<Producto[]> {
  if (!hasPublicInsforgeKey()) {
    return []
  }

  try {
    const { data: productosData, error: productosError } = await supabase
      .from('productos')
      .select(`
        id,
        nombre,
        slug,
        descripcion,
        precio,
        precio_mayor,
        estado,
        foto_principal,
        created_at,
        colores (
          id,
          producto_id,
          nombre,
          hex,
          created_at,
          fotos_color (
            id,
            color_id,
            url,
            created_at
          )
        ),
        tallas (
          id,
          producto_id,
          talla,
          en_stock,
          created_at
        ),
        fotos_medidas (
          id,
          producto_id,
          url,
          created_at
        )
      `)
      .eq('estado', 'activo')
      .order('created_at', { ascending: false })

    if (productosError) throw productosError

    // Transformar los datos al formato esperado
    const productosFormateados: Producto[] = productosData?.map(producto => ({
      id: producto.id,
      nombre: producto.nombre,
      slug: producto.slug,
      descripcion: producto.descripcion || '',
      precio: producto.precio,
      precio_mayor: producto.precio_mayor,
      estado: producto.estado,
      foto_principal: producto.foto_principal || '',
      created_at: producto.created_at,
      colores: producto.colores?.map((color: SupabaseColor) => ({
        id: color.id,
        producto_id: color.producto_id,
        nombre: color.nombre,
        hex: color.hex,
        fotos: color.fotos_color?.map((foto: SupabaseFotoColor) => ({
          id: foto.id,
          color_id: foto.color_id,
          url: foto.url,
          created_at: foto.created_at
        })) || [],
        created_at: color.created_at
      })) || [],
      tallas: producto.tallas?.map((talla: SupabaseTalla) => ({
        id: talla.id,
        producto_id: talla.producto_id,
        talla: talla.talla,
        en_stock: talla.en_stock,
        created_at: talla.created_at
      })) || [],
      fotos_medidas: producto.fotos_medidas?.map((foto: SupabaseFotoMedida) => ({
        id: foto.id,
        producto_id: foto.producto_id,
        url: foto.url,
        created_at: foto.created_at
      })) || []
    })) || []

    return productosFormateados
  } catch (err) {
    console.error('Error fetching productos:', err)
    return []
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const producto = await getProductoBySlug(slug)
  if (!producto) {
    return { title: 'Producto no encontrado' }
  }

  const title = `${producto.nombre} — Jeans ${SITE_NAME}`
  const description =
    producto.descripcion?.slice(0, 155) ||
    `Compra ${producto.nombre} en Excusas Jeans (excusasjeans.com). Jeans, excusas y moda denim en Perú.`

  return buildPageMetadata({
    title,
    description,
    path: `/producto/${slug}`,
    keywords: [
      producto.nombre,
      'jeans',
      'excusas jeans',
      'excusas',
      'excusasjeans',
    ],
    ogImage: producto.foto_principal || '/logo-excusas.png',
  })
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const producto = await getProductoBySlug(slug)

  if (!producto) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={buildProductJsonLd(producto)} />
      <Header />
      <main className="container mx-auto px-4 pt-20 sm:pt-24 md:pt-28 pb-4 sm:pb-6 md:pb-8">
        <ProductDetail producto={producto} />
      </main>
    </div>
  )
}

export const dynamicParams = true

export async function generateStaticParams() {
  const productos = await getProductos()

  return productos.map((producto) => ({
    slug: producto.slug,
  }))
}
