import type { Producto } from '@/data/productos'

export const PRODUCTOS_ACTIVE_SELECT = `
  *,
  colores (
    *,
    fotos_color (*)
  ),
  tallas (*),
  fotos_medidas (*)
`

export interface ProductoColorRow {
  id: string
  producto_id: string
  nombre: string
  hex: string
  created_at: string
  fotos_color: ProductoFotoColorRow[]
}

export interface ProductoFotoColorRow {
  id: string
  color_id: string
  url: string
  created_at: string
}

export interface ProductoTallaRow {
  id: string
  producto_id: string
  talla: string
  en_stock: boolean
  created_at: string
}

export interface ProductoFotoMedidaRow {
  id: string
  producto_id: string
  url: string
  created_at: string
}

export interface ProductoRow {
  id: string
  nombre: string
  slug: string
  descripcion: string | null
  precio: number | null
  precio_mayor: number | null
  estado: string
  created_at: string
  foto_principal: string | null
  colores: ProductoColorRow[]
  tallas: ProductoTallaRow[]
  fotos_medidas: ProductoFotoMedidaRow[]
}

export function mapProductoFromRow(producto: ProductoRow): Producto {
  return {
    id: producto.id,
    nombre: producto.nombre,
    slug: producto.slug,
    descripcion: producto.descripcion || '',
    precio: producto.precio ?? undefined,
    precio_mayor: producto.precio_mayor ?? undefined,
    estado: producto.estado,
    foto_principal: producto.foto_principal || '',
    created_at: producto.created_at,
    colores: producto.colores?.map((color) => ({
      id: color.id,
      producto_id: color.producto_id,
      nombre: color.nombre,
      hex: color.hex,
      fotos: color.fotos_color?.map((foto) => ({
        id: foto.id,
        color_id: foto.color_id,
        url: foto.url,
        created_at: foto.created_at,
      })) || [],
      created_at: color.created_at,
    })) || [],
    tallas: producto.tallas?.map((talla) => ({
      id: talla.id,
      producto_id: talla.producto_id,
      talla: talla.talla,
      en_stock: talla.en_stock,
      created_at: talla.created_at,
    })) || [],
    fotos_medidas: producto.fotos_medidas?.map((foto) => ({
      id: foto.id,
      producto_id: foto.producto_id,
      url: foto.url,
      created_at: foto.created_at,
    })) || [],
  }
}
