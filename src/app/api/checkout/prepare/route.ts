import { NextResponse } from 'next/server'
import { getCulqiPublicKey, solesToCulqiAmount } from '@/lib/culqi'
import {
  validateAndPriceCartItems,
  createPedidoPending,
  type CheckoutLineItem,
  type ShippingPayload,
} from '@/lib/orders-server'
import { getShippingCost, isLimaProvincia } from '@/lib/shipping'
import {
  computeWelcomeDiscountAmount,
  isEligibleForWelcomeDiscount,
} from '@/lib/welcome-discount'

type Body = {
  items: CheckoutLineItem[]
  shipping: ShippingPayload
  usuario_id?: string | null
  apply_welcome_discount?: boolean
}

function validateShipping(shipping: ShippingPayload) {
  if (!shipping.nombre_cliente?.trim()) throw new Error('Nombre requerido')
  if (!shipping.email_cliente?.trim()) throw new Error('Correo requerido')
  if (!shipping.telefono?.trim()) throw new Error('Teléfono requerido')
  if (!shipping.dni?.trim()) throw new Error('DNI o C.E. requerido')
  if (!shipping.provincia?.trim()) throw new Error('Provincia requerida')

  const esLima = isLimaProvincia(shipping.provincia)
  if (esLima) {
    if (!shipping.distrito?.trim()) throw new Error('Distrito requerido para Lima')
    if (!shipping.direccion?.trim()) throw new Error('Dirección requerida para Lima')
    shipping.tipo_envio = 'lima'
  } else {
    shipping.tipo_envio = 'provincia'
    if (!shipping.sede_envio?.trim()) {
      throw new Error('Indica la sede o agencia Shalom de destino')
    }
    shipping.empresa_envio = 'Shalom'
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body
    if (!body.items?.length) {
      return NextResponse.json({ error: 'Carrito vacío' }, { status: 400 })
    }

    validateShipping(body.shipping)

    const { priced, subtotal } = await validateAndPriceCartItems(body.items)
    const costo_envio = getShippingCost(
      body.shipping.tipo_envio,
      body.shipping.distrito ?? ''
    )
    let descuento = 0
    if (body.apply_welcome_discount) {
      if (!body.usuario_id) {
        return NextResponse.json(
          { error: 'Inicia sesión para aplicar el descuento de primera compra.' },
          { status: 400 }
        )
      }
      const eligible = await isEligibleForWelcomeDiscount({
        usuarioId: body.usuario_id,
        email: body.shipping.email_cliente,
      })
      if (!eligible) {
        return NextResponse.json(
          { error: 'El descuento de primera compra no está disponible para esta cuenta o correo.' },
          { status: 400 }
        )
      }
      descuento = computeWelcomeDiscountAmount(subtotal)
    }

    const total = Math.max(0, subtotal - descuento + costo_envio)

    const pedido = await createPedidoPending({
      usuario_id: body.usuario_id,
      shipping: body.shipping,
      priced,
      subtotal,
      descuento,
      costo_envio,
      total,
    })

    return NextResponse.json({
      pedido_id: pedido.id,
      numero_pedido: pedido.numero_pedido,
      subtotal,
      descuento,
      costo_envio,
      total,
      amount_cents: solesToCulqiAmount(total),
      public_key: getCulqiPublicKey(),
      email: body.shipping.email_cliente.trim(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al preparar el pago'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
