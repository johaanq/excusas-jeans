import { insforgeClient } from '@/lib/insforge-client'
import type { Carrito } from '@/types/user'

const CART_SELECT = `
  *,
  items:carrito_items (
    *,
    producto:productos (id, nombre, slug, precio, precio_mayor, foto_principal),
    color:colores (id, nombre, hex, fotos_color (id, url))
  )
`

type DbError = { code?: string; statusCode?: number; message?: string }

function isNoRowsError(error: DbError | null | undefined): boolean {
  if (!error) return false
  if (error.code === 'PGRST116') return true
  if (error.statusCode === 406) return true
  const msg = (error.message || '').toLowerCase()
  return msg.includes('0 rows') || msg.includes('no rows')
}

function isUniqueConflict(error: DbError | null | undefined): boolean {
  if (!error) return false
  if (error.statusCode === 409) return true
  if (error.code === '23505') return true
  const msg = (error.message || '').toLowerCase()
  return msg.includes('duplicate') || msg.includes('unique') || msg.includes('conflict')
}

function isForeignKeyViolation(error: DbError | null | undefined): boolean {
  if (!error) return false
  if (error.code === '23503') return true
  if (error.statusCode === 409) {
    const msg = (error.message || '').toLowerCase()
    if (msg.includes('foreign key') || msg.includes('usuarios')) return true
  }
  const msg = (error.message || '').toLowerCase()
  return msg.includes('foreign key') || msg.includes('usuarios')
}

/** Obtiene el carrito del usuario o crea uno si no existe (idempotente). */
export async function fetchOrCreateUserCart(userId: string): Promise<Carrito | null> {
  const fetchCart = () =>
    insforgeClient
      .from('carritos')
      .select(CART_SELECT)
      .eq('usuario_id', userId)
      .maybeSingle()

  const { data: existing, error: fetchError } = await fetchCart()

  if (existing) return existing as Carrito

  if (fetchError && !isNoRowsError(fetchError)) {
    console.error('Error loading cart:', fetchError)
    return null
  }

  const { data: created, error: insertError } = await insforgeClient
    .from('carritos')
    .insert({ usuario_id: userId })
    .select(CART_SELECT)
    .maybeSingle()

  if (created) return created as Carrito

  if (isUniqueConflict(insertError) || isForeignKeyViolation(insertError)) {
    const { data: retry } = await fetchCart()
    return (retry as Carrito) ?? null
  }

  if (insertError) {
    console.error('Error creating cart:', insertError)
  }

  return null
}
