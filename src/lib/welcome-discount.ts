import { getInsforgeAdmin } from './insforge-admin'

export const WELCOME_DISCOUNT_PERCENT = 5
export const WELCOME_DISCOUNT_RATE = WELCOME_DISCOUNT_PERCENT / 100

const PAID_STATES = ['pagado', 'en_preparacion', 'enviado', 'entregado'] as const

export function computeWelcomeDiscountAmount(subtotal: number): number {
  return Math.round(subtotal * WELCOME_DISCOUNT_RATE * 100) / 100
}

async function countPaidOrdersByUsuario(usuarioId: string): Promise<number> {
  const admin = getInsforgeAdmin()
  const { count, error } = await admin.database
    .from('pedidos')
    .select('id', { count: 'exact', head: true })
    .eq('usuario_id', usuarioId)
    .in('estado', [...PAID_STATES])

  if (error) throw new Error(error.message)
  return count ?? 0
}

async function countPaidOrdersByEmail(email: string): Promise<number> {
  const admin = getInsforgeAdmin()
  const normalized = email.trim().toLowerCase()
  const { count, error } = await admin.database
    .from('pedidos')
    .select('id', { count: 'exact', head: true })
    .eq('email_cliente', normalized)
    .in('estado', [...PAID_STATES])

  if (error) throw new Error(error.message)
  return count ?? 0
}

/** Primera compra: sin pedidos pagados previos por usuario o correo. */
export async function isEligibleForWelcomeDiscount(params: {
  usuarioId?: string | null
  email?: string | null
}): Promise<boolean> {
  const email = params.email?.trim()
  const usuarioId = params.usuarioId?.trim()

  if (!usuarioId && !email) return false

  if (usuarioId) {
    const byUser = await countPaidOrdersByUsuario(usuarioId)
    if (byUser > 0) return false
  }

  if (email) {
    const byEmail = await countPaidOrdersByEmail(email)
    if (byEmail > 0) return false
  }

  return true
}
