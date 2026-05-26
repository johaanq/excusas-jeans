import { getInsforgeAdmin } from './insforge-admin'
import type { TipoEnvio } from './shipping'

export type CheckoutLineItem = {
  producto_id: string
  color_id: string
  talla: string
  cantidad: number
}

export type ShippingPayload = {
  tipo_envio: TipoEnvio
  nombre_cliente: string
  email_cliente: string
  telefono: string
  dni?: string
  provincia: string
  distrito?: string
  direccion?: string
  referencia?: string
  empresa_envio?: string
  sede_envio?: string
}

function generateNumeroPedido(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const r = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `EJ-${y}${m}${day}-${r}`
}

export async function validateAndPriceCartItems(items: CheckoutLineItem[]) {
  if (!items.length) throw new Error('El carrito está vacío')

  const admin = getInsforgeAdmin()
  const priced: {
    producto_id: string
    color_id: string
    talla: string
    cantidad: number
    producto_nombre: string
    color_nombre: string
    precio_unitario: number
    subtotal: number
  }[] = []

  let subtotal = 0

  for (const item of items) {
    const { data: producto, error: pErr } = await admin.database
      .from('productos')
      .select('id, nombre, precio, estado')
      .eq('id', item.producto_id)
      .single()

    if (pErr || !producto) throw new Error('Producto no encontrado')
    if (producto.estado !== 'activo') throw new Error(`"${producto.nombre}" no está disponible`)
    if (producto.precio == null || Number(producto.precio) <= 0) {
      throw new Error(`"${producto.nombre}" no tiene precio configurado`)
    }

    const { data: color, error: cErr } = await admin.database
      .from('colores')
      .select('id, nombre, producto_id')
      .eq('id', item.color_id)
      .single()

    if (cErr || !color || color.producto_id !== item.producto_id) {
      throw new Error('Color no válido para el producto')
    }

    const { data: tallaRow } = await admin.database
      .from('tallas')
      .select('en_stock')
      .eq('producto_id', item.producto_id)
      .eq('talla', item.talla)
      .maybeSingle()

    if (tallaRow && tallaRow.en_stock === false) {
      throw new Error(`Talla ${item.talla} sin stock en "${producto.nombre}"`)
    }

    const precio = Number(producto.precio)
    const lineSubtotal = precio * item.cantidad
    subtotal += lineSubtotal

    priced.push({
      producto_id: item.producto_id,
      color_id: item.color_id,
      talla: item.talla,
      cantidad: item.cantidad,
      producto_nombre: producto.nombre,
      color_nombre: color.nombre,
      precio_unitario: precio,
      subtotal: lineSubtotal,
    })
  }

  return { priced, subtotal }
}

export async function createPedidoPending(params: {
  usuario_id?: string | null
  shipping: ShippingPayload
  priced: Awaited<ReturnType<typeof validateAndPriceCartItems>>['priced']
  subtotal: number
  costo_envio: number
  total: number
}) {
  const admin = getInsforgeAdmin()
  const numero = generateNumeroPedido()

  const { data: pedido, error } = await admin.database
    .from('pedidos')
    .insert({
      numero_pedido: numero,
      usuario_id: params.usuario_id ?? null,
      estado: 'pendiente_pago',
      tipo_envio: params.shipping.tipo_envio,
      nombre_cliente: params.shipping.nombre_cliente,
      email_cliente: params.shipping.email_cliente,
      telefono: params.shipping.telefono,
      dni: params.shipping.dni ?? null,
      provincia: params.shipping.provincia,
      distrito: params.shipping.distrito ?? null,
      direccion: params.shipping.direccion ?? null,
      referencia: params.shipping.referencia ?? null,
      empresa_envio: params.shipping.empresa_envio ?? null,
      sede_envio: params.shipping.sede_envio ?? null,
      subtotal: params.subtotal,
      costo_envio: params.costo_envio,
      total: params.total,
      moneda: 'PEN',
    })
    .select('*')
    .single()

  if (error || !pedido) throw new Error(error?.message ?? 'No se pudo crear el pedido')

  const itemRows = params.priced.map((p) => ({
    pedido_id: pedido.id,
    producto_id: p.producto_id,
    color_id: p.color_id,
    producto_nombre: p.producto_nombre,
    color_nombre: p.color_nombre,
    talla: p.talla,
    cantidad: p.cantidad,
    precio_unitario: p.precio_unitario,
    subtotal: p.subtotal,
  }))

  const { error: itemsErr } = await admin.database.from('pedido_items').insert(itemRows)
  if (itemsErr) throw new Error(itemsErr.message)

  return pedido
}

/** Referencia externa de pago (Culqi charge id u orden). */
export async function attachPaymentReference(pedidoId: string, reference: string) {
  const admin = getInsforgeAdmin()
  await admin.database
    .from('pedidos')
    .update({ stripe_session_id: reference })
    .eq('id', pedidoId)
}

export async function markPedidoPaid(params: {
  pedidoId: string
  paymentId?: string | null
}) {
  const admin = getInsforgeAdmin()
  const { data, error } = await admin.database
    .from('pedidos')
    .update({
      estado: 'pagado',
      stripe_payment_intent_id: params.paymentId ?? null,
      paid_at: new Date().toISOString(),
    })
    .eq('id', params.pedidoId)
    .select('id, usuario_id, numero_pedido, tipo_envio, estado')
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function clearUserCart(usuarioId: string) {
  const admin = getInsforgeAdmin()
  const { data: carrito } = await admin.database
    .from('carritos')
    .select('id')
    .eq('usuario_id', usuarioId)
    .maybeSingle()

  if (carrito?.id) {
    await admin.database.from('carrito_items').delete().eq('carrito_id', carrito.id)
  }
}

export async function getPedidoByPaymentReference(reference: string) {
  const admin = getInsforgeAdmin()
  const { data } = await admin.database
    .from('pedidos')
    .select('*, pedido_items(*)')
    .eq('stripe_session_id', reference)
    .maybeSingle()
  return data
}

export async function getPedidoByNumero(numeroPedido: string) {
  const admin = getInsforgeAdmin()
  const { data } = await admin.database
    .from('pedidos')
    .select('*, pedido_items(*)')
    .eq('numero_pedido', numeroPedido)
    .maybeSingle()
  return data
}

export async function getPedidoById(pedidoId: string) {
  const admin = getInsforgeAdmin()
  const { data } = await admin.database
    .from('pedidos')
    .select('*, pedido_items(*)')
    .eq('id', pedidoId)
    .maybeSingle()
  return data
}
