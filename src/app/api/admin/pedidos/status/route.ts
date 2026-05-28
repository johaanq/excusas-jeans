import { NextResponse } from 'next/server'
import { getInsforgeAdmin } from '@/lib/insforge-admin'
import { verifyAdminCredentials } from '@/lib/admin-verify-server'
import type { PedidoEstado } from '@/types/pedido'
import {
  buildWhatsAppEstadoUrl,
  sendPedidoEstadoEmail,
} from '@/lib/order-notifications'

type Body = {
  credentials: { username: string; password: string }
  pedidoId: string
  estado: PedidoEstado
  comprobanteUrl?: string | null
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body
    const { credentials, pedidoId, estado } = body

    if (!credentials?.username || !credentials?.password) {
      return NextResponse.json({ error: 'Credenciales requeridas' }, { status: 401 })
    }
    if (!(await verifyAdminCredentials(credentials.username, credentials.password))) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }
    if (!pedidoId || !estado) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    const comprobanteUrl = body.comprobanteUrl?.trim() || null
    if (estado === 'enviado' && !comprobanteUrl) {
      return NextResponse.json(
        { error: 'Para marcar como enviado debes adjuntar comprobante.' },
        { status: 400 }
      )
    }

    const admin = getInsforgeAdmin()
    const { data: pedido, error: fetchErr } = await admin.database
      .from('pedidos')
      .select('*')
      .eq('id', pedidoId)
      .single()

    if (fetchErr || !pedido) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    const extraNote = comprobanteUrl ? `Comprobante envío: ${comprobanteUrl}` : null
    const notas = [pedido.notas, extraNote].filter(Boolean).join('\n')

    const { error: updateErr } = await admin.database
      .from('pedidos')
      .update({ estado, notas })
      .eq('id', pedidoId)
    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 400 })
    }

    let emailSent = false
    try {
      await sendPedidoEstadoEmail({
        pedido,
        estado,
        comprobanteUrl,
      })
      emailSent = true
    } catch (err) {
      console.error('sendPedidoEstadoEmail:', err)
    }

    const whatsappUrl = buildWhatsAppEstadoUrl({
      telefono: pedido.telefono,
      numeroPedido: pedido.numero_pedido,
      estado,
      comprobanteUrl,
      tipoEnvio: pedido.tipo_envio,
    })

    return NextResponse.json({
      ok: true,
      emailSent,
      whatsappUrl,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
