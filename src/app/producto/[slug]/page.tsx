import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Header } from "@/components/header"
import { ProductDetail } from "@/components/product-detail"
import { JsonLd } from "@/components/seo/json-ld"
import { hasPublicInsforgeKey } from "@/lib/insforge"
import { insforgeClient } from "@/lib/insforge-client"
import { mapProductoFromRow, PRODUCTOS_ACTIVE_SELECT, type ProductoRow } from "@/lib/producto-db"
import { buildPageMetadata, buildProductJsonLd } from "@/lib/seo"
import { SITE_NAME } from "@/lib/site"
import type { Producto } from "@/data/productos"

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
    const { data: productoData, error: productoError } = await insforgeClient
      .from('productos')
      .select(PRODUCTOS_ACTIVE_SELECT)
      .eq('slug', slug)
      .eq('estado', 'activo')
      .single()

    if (productoError) throw productoError

    if (!productoData) return null

    return mapProductoFromRow(productoData as ProductoRow)
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
    const { data: productosData, error: productosError } = await insforgeClient
      .from('productos')
      .select(PRODUCTOS_ACTIVE_SELECT)
      .eq('estado', 'activo')
      .order('created_at', { ascending: false })

    if (productosError) throw productosError

    return productosData?.map((row) => mapProductoFromRow(row as ProductoRow)) ?? []
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
    <div className="min-h-screen bg-[var(--store-bg)] text-stone-900">
      <JsonLd data={buildProductJsonLd(producto)} />
      <Header />
      <main className="store-container-wide pb-16 pt-20 sm:pt-24 md:pt-28">
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
