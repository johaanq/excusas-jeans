export interface Producto {
  id: string
  nombre: string
  slug: string
  descripcion: string
  precio?: number
  precio_mayor?: number
  estado: string
  created_at: string
  foto_principal: string
  colores: Color[]
  tallas: Talla[]
  fotos_medidas: FotoMedida[]
}

export interface Color {
  id: string
  producto_id: string
  nombre: string
  hex: string
  fotos: FotoColor[]
  created_at: string
}

export interface FotoColor {
  id: string
  color_id: string
  url: string
  created_at: string
}

export interface Talla {
  id: string
  producto_id: string
  talla: string
  en_stock: boolean
  created_at: string
}

export interface FotoMedida {
  id: string
  producto_id: string
  url: string
  created_at: string
}

// Supabase raw data interfaces
export interface SupabaseColor {
  id: string
  producto_id: string
  nombre: string
  hex: string
  created_at: string
  fotos_color: SupabaseFotoColor[]
}

export interface SupabaseFotoColor {
  id: string
  color_id: string
  url: string
  created_at: string
}

export interface SupabaseTalla {
  id: string
  producto_id: string
  talla: string
  en_stock: boolean
  created_at: string
}

export interface SupabaseFotoMedida {
  id: string
  producto_id: string
  url: string
  created_at: string
}

export interface SupabaseProducto {
  id: string
  nombre: string
  slug: string
  descripcion: string | null
  precio: number | null
  precio_mayor: number | null
  estado: string
  created_at: string
  foto_principal: string | null
  colores: SupabaseColor[]
  tallas: SupabaseTalla[]
  fotos_medidas: SupabaseFotoMedida[]
}
