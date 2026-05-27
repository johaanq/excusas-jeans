export interface Usuario {
  id: string
  nombre: string
  email: string
  telefono?: string
  dni?: string
  provincia?: string
  distrito?: string
  direccion?: string
  referencia?: string
  codigo_postal?: string
  empresa_envio?: string
  sede_envio?: string
  created_at: string
  updated_at: string
}

export interface Carrito {
  id: string
  usuario_id: string
  created_at: string
  updated_at: string
  items: CarritoItem[]
}

export interface CarritoItem {
  id: string
  carrito_id: string
  producto_id: string
  color_id: string
  talla: string
  cantidad: number
  created_at: string
  updated_at: string
  producto?: {
    id: string
    nombre: string
    slug: string
    precio?: number
    precio_mayor?: number
    foto_principal?: string
  }
  color?: {
    id: string
    nombre: string
    hex: string
    fotos_color?: { id: string; url: string }[]
  }
}

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  nombre: string
  email: string
  telefono?: string
  password: string
}
