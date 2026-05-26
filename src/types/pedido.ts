export type PedidoEstado =
  | 'pendiente_pago'
  | 'pagado'
  | 'en_preparacion'
  | 'enviado'
  | 'entregado'
  | 'cancelado'

export type TipoEnvio = 'lima' | 'provincia'

export interface PedidoItem {
  id: string
  pedido_id: string
  producto_id: string
  color_id: string
  producto_nombre: string
  color_nombre: string
  talla: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

export interface Pedido {
  id: string
  numero_pedido: string
  usuario_id: string | null
  estado: PedidoEstado
  tipo_envio: TipoEnvio
  nombre_cliente: string
  email_cliente: string
  telefono: string
  dni: string | null
  provincia: string
  distrito: string | null
  direccion: string | null
  referencia: string | null
  empresa_envio: string | null
  sede_envio: string | null
  subtotal: number
  costo_envio: number
  total: number
  moneda: string
  stripe_session_id: string | null
  stripe_payment_intent_id: string | null
  notas: string | null
  paid_at: string | null
  created_at: string
  updated_at: string
  pedido_items?: PedidoItem[]
}

export const PEDIDO_ESTADO_LABEL: Record<PedidoEstado, string> = {
  pendiente_pago: 'Pendiente de pago',
  pagado: 'Pagado',
  en_preparacion: 'En preparación',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}
