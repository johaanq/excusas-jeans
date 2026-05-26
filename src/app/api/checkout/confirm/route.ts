import { NextResponse } from 'next/server'
import { getPedidoByNumero } from '@/lib/orders-server'

/** Consulta estado del pedido tras pago Culqi (página de éxito). */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const numero = searchParams.get('numero') ?? searchParams.get('pedido')

  if (!numero?.trim()) {
    return NextResponse.json({ error: 'Número de pedido requerido' }, { status: 400 })
  }

  const pedido = await getPedidoByNumero(numero.trim())
  if (!pedido) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  }

  return NextResponse.json({
    numero_pedido: pedido.numero_pedido,
    tipo_envio: pedido.tipo_envio,
    estado: pedido.estado,
    pending: pedido.estado === 'pendiente_pago',
  })
}
