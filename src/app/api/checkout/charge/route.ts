import { NextResponse } from 'next/server'
import { createCulqiCharge } from '@/lib/culqi'
import {
  attachPaymentReference,
  markPedidoPaid,
  clearUserCart,
  getPedidoById,
} from '@/lib/orders-server'
import { sendPedidoEstadoEmail } from '@/lib/order-notifications'

type Body = {
  pedido_id: string
  token_id: string
  email: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body
    if (!body.pedido_id || !body.token_id) {
      return NextResponse.json({ error: 'Datos de pago incompletos' }, { status: 400 })
    }

    const pedido = await getPedidoById(body.pedido_id)
    if (!pedido) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }
    if (pedido.estado === 'pagado') {
      return NextResponse.json({
        ok: true,
        numero_pedido: pedido.numero_pedido,
        tipo_envio: pedido.tipo_envio,
      })
    }

    const amountCents = Math.round(Number(pedido.total) * 100)
    const charge = await createCulqiCharge({
      amountCents,
      email: body.email || pedido.email_cliente,
      sourceId: body.token_id,
      pedidoId: pedido.id,
      numeroPedido: pedido.numero_pedido,
    })

    const chargeId = charge.id
    if (!chargeId) throw new Error('Culqi no devolvió ID de cargo')

    await attachPaymentReference(pedido.id, chargeId)
    const updated = await markPedidoPaid({
      pedidoId: pedido.id,
      paymentId: chargeId,
    })

    if (updated?.usuario_id) {
      await clearUserCart(updated.usuario_id)
    }

    try {
      await sendPedidoEstadoEmail({
        pedido,
        estado: 'pagado',
        items: pedido.pedido_items ?? [],
      })
    } catch (mailError) {
      console.error('sendPedidoEstadoEmail(pagado):', mailError)
    }

    return NextResponse.json({
      ok: true,
      numero_pedido: pedido.numero_pedido,
      tipo_envio: pedido.tipo_envio,
      charge_id: chargeId,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al procesar el pago'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
