export interface Producto {
  id: string
  nombre: string
  slug: string
  descripcion: string
  precio?: number
  precio_mayor?: number
  estado: string
  created_at: string
  foto_principal: string // Imagen principal del producto
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

// Datos de ejemplo para el catálogo
export const productosEjemplo: Producto[] = [
  {
    id: "1",
    nombre: "Jeans Clásicos Azul",
    slug: "jeans-clasicos-azul",
    descripcion: "Jeans clásicos de corte recto en azul denim. Perfectos para cualquier ocasión.",
    precio: 45.99,
    estado: "activo",
    created_at: "2024-01-15T10:00:00Z",
    foto_principal: "/hero-1.jpg",
    colores: [
      {
        id: "1",
        producto_id: "1",
        nombre: "Azul Clásico",
        hex: "#1e3a8a",
        fotos: [
          {
            id: "1",
            color_id: "1",
            url: "/hero-1.jpg",
            created_at: "2024-01-15T10:00:00Z"
          }
        ],
        created_at: "2024-01-15T10:00:00Z"
      }
    ],
    tallas: [
      { id: "1", producto_id: "1", talla: "S", en_stock: true, created_at: "2024-01-15T10:00:00Z" },
      { id: "2", producto_id: "1", talla: "M", en_stock: true, created_at: "2024-01-15T10:00:00Z" },
      { id: "3", producto_id: "1", talla: "L", en_stock: true, created_at: "2024-01-15T10:00:00Z" },
      { id: "4", producto_id: "1", talla: "XL", en_stock: false, created_at: "2024-01-15T10:00:00Z" }
    ],
    fotos_medidas: [
      {
        id: "1",
        producto_id: "1",
        url: "/hero-2.jpg",
        created_at: "2024-01-15T10:00:00Z"
      }
    ]
  },
  {
    id: "2",
    nombre: "Jeans Skinny Negro",
    slug: "jeans-skinny-negro",
    descripcion: "Jeans skinny en negro con elastano para mayor comodidad. Ideal para looks casuales.",
    precio: 52.99,
    estado: "activo",
    created_at: "2024-01-16T10:00:00Z",
    foto_principal: "/hero-3.jpg",
    colores: [
      {
        id: "2",
        producto_id: "2",
        nombre: "Negro",
        hex: "#000000",
        fotos: [
          {
            id: "2",
            color_id: "2",
            url: "/hero-3.jpg",
            created_at: "2024-01-16T10:00:00Z"
          }
        ],
        created_at: "2024-01-16T10:00:00Z"
      }
    ],
    tallas: [
      { id: "5", producto_id: "2", talla: "S", en_stock: true, created_at: "2024-01-16T10:00:00Z" },
      { id: "6", producto_id: "2", talla: "M", en_stock: true, created_at: "2024-01-16T10:00:00Z" },
      { id: "7", producto_id: "2", talla: "L", en_stock: true, created_at: "2024-01-16T10:00:00Z" },
      { id: "8", producto_id: "2", talla: "XL", en_stock: true, created_at: "2024-01-16T10:00:00Z" }
    ],
    fotos_medidas: [
      {
        id: "2",
        producto_id: "2",
        url: "/hero-1.jpg",
        created_at: "2024-01-16T10:00:00Z"
      }
    ]
  },
  {
    id: "3",
    nombre: "Jeans Mom Fit",
    slug: "jeans-mom-fit",
    descripcion: "Jeans mom fit con cintura alta y corte relajado. Tendencia retro con estilo moderno.",
    precio: 48.99,
    estado: "activo",
    created_at: "2024-01-17T10:00:00Z",
    foto_principal: "/hero-2.jpg",
    colores: [
      {
        id: "3",
        producto_id: "3",
        nombre: "Azul Desgastado",
        hex: "#3b82f6",
        fotos: [
          {
            id: "3",
            color_id: "3",
            url: "/hero-2.jpg",
            created_at: "2024-01-17T10:00:00Z"
          }
        ],
        created_at: "2024-01-17T10:00:00Z"
      }
    ],
    tallas: [
      { id: "9", producto_id: "3", talla: "S", en_stock: true, created_at: "2024-01-17T10:00:00Z" },
      { id: "10", producto_id: "3", talla: "M", en_stock: true, created_at: "2024-01-17T10:00:00Z" },
      { id: "11", producto_id: "3", talla: "L", en_stock: false, created_at: "2024-01-17T10:00:00Z" },
      { id: "12", producto_id: "3", talla: "XL", en_stock: true, created_at: "2024-01-17T10:00:00Z" }
    ],
    fotos_medidas: [
      {
        id: "3",
        producto_id: "3",
        url: "/hero-3.jpg",
        created_at: "2024-01-17T10:00:00Z"
      }
    ]
  },
  {
    id: "4",
    nombre: "Jeans Boyfriend Gris",
    slug: "jeans-boyfriend-gris",
    descripcion: "Jeans boyfriend en gris con corte holgado y estilo desenfadado. Perfectos para el día a día.",
    precio: 44.99,
    estado: "activo",
    created_at: "2024-01-18T10:00:00Z",
    foto_principal: "/hero-1.jpg",
    colores: [
      {
        id: "4",
        producto_id: "4",
        nombre: "Gris Claro",
        hex: "#6b7280",
        fotos: [
          {
            id: "4",
            color_id: "4",
            url: "/hero-1.jpg",
            created_at: "2024-01-18T10:00:00Z"
          }
        ],
        created_at: "2024-01-18T10:00:00Z"
      }
    ],
    tallas: [
      { id: "13", producto_id: "4", talla: "S", en_stock: true, created_at: "2024-01-18T10:00:00Z" },
      { id: "14", producto_id: "4", talla: "M", en_stock: true, created_at: "2024-01-18T10:00:00Z" },
      { id: "15", producto_id: "4", talla: "L", en_stock: true, created_at: "2024-01-18T10:00:00Z" },
      { id: "16", producto_id: "4", talla: "XL", en_stock: true, created_at: "2024-01-18T10:00:00Z" }
    ],
    fotos_medidas: [
      {
        id: "4",
        producto_id: "4",
        url: "/hero-2.jpg",
        created_at: "2024-01-18T10:00:00Z"
      }
    ]
  },
  {
    id: "5",
    nombre: "Jeans High Waist Blanco",
    slug: "jeans-high-waist-blanco",
    descripcion: "Jeans de cintura alta en blanco roto. Elegantes y versátiles para cualquier look.",
    precio: 55.99,
    estado: "activo",
    created_at: "2024-01-19T10:00:00Z",
    foto_principal: "/hero-3.jpg",
    colores: [
      {
        id: "5",
        producto_id: "5",
        nombre: "Blanco Roto",
        hex: "#f3f4f6",
        fotos: [
          {
            id: "5",
            color_id: "5",
            url: "/hero-3.jpg",
            created_at: "2024-01-19T10:00:00Z"
          }
        ],
        created_at: "2024-01-19T10:00:00Z"
      }
    ],
    tallas: [
      { id: "17", producto_id: "5", talla: "S", en_stock: false, created_at: "2024-01-19T10:00:00Z" },
      { id: "18", producto_id: "5", talla: "M", en_stock: true, created_at: "2024-01-19T10:00:00Z" },
      { id: "19", producto_id: "5", talla: "L", en_stock: true, created_at: "2024-01-19T10:00:00Z" },
      { id: "20", producto_id: "5", talla: "XL", en_stock: true, created_at: "2024-01-19T10:00:00Z" }
    ],
    fotos_medidas: [
      {
        id: "5",
        producto_id: "5",
        url: "/hero-1.jpg",
        created_at: "2024-01-19T10:00:00Z"
      }
    ]
  },
  {
    id: "6",
    nombre: "Jeans Flare Vintage",
    slug: "jeans-flare-vintage",
    descripcion: "Jeans flare vintage con estilo retro. Perfectos para crear looks únicos y llamativos.",
    precio: 49.99,
    estado: "activo",
    created_at: "2024-01-20T10:00:00Z",
    foto_principal: "/hero-2.jpg",
    colores: [
      {
        id: "6",
        producto_id: "6",
        nombre: "Azul Vintage",
        hex: "#1e40af",
        fotos: [
          {
            id: "6",
            color_id: "6",
            url: "/hero-2.jpg",
            created_at: "2024-01-20T10:00:00Z"
          }
        ],
        created_at: "2024-01-20T10:00:00Z"
      }
    ],
    tallas: [
      { id: "21", producto_id: "6", talla: "S", en_stock: true, created_at: "2024-01-20T10:00:00Z" },
      { id: "22", producto_id: "6", talla: "M", en_stock: true, created_at: "2024-01-20T10:00:00Z" },
      { id: "23", producto_id: "6", talla: "L", en_stock: true, created_at: "2024-01-20T10:00:00Z" },
      { id: "24", producto_id: "6", talla: "XL", en_stock: false, created_at: "2024-01-20T10:00:00Z" }
    ],
    fotos_medidas: [
      {
        id: "6",
        producto_id: "6",
        url: "/hero-3.jpg",
        created_at: "2024-01-20T10:00:00Z"
      }
    ]
  }
]

export async function getProductos(): Promise<Producto[]> {
  // Simular delay de API
  await new Promise(resolve => setTimeout(resolve, 1000))
  return productosEjemplo
}

export async function getProductoBySlug(slug: string): Promise<Producto | null> {
  // Simular delay de API
  await new Promise(resolve => setTimeout(resolve, 500))
  return productosEjemplo.find(producto => producto.slug === slug) || null
}
