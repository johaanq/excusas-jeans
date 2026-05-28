import { WHATSAPP_NUMBER_DISPLAY } from '@/lib/site'
import { sendEmail } from '@/lib/send-email'
import type { Pedido, PedidoEstado } from '@/types/pedido'

type PedidoItemEmail = {
  producto_nombre: string
  color_nombre: string
  talla: string
  cantidad: number
  subtotal: number
}

const SHALOM_TRACKING_URL = 'https://www.shalom.com.pe'

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function currency(value: number): string {
  return `S/ ${Number(value).toFixed(2)}`
}

function renderPedidoItemsTable(items: PedidoItemEmail[]): string {
  if (!items.length) return ''
  const rows = items
    .map(
      (item) =>
        `<tr>
          <td style="padding:6px 0;">${escapeHtml(item.producto_nombre)} (${escapeHtml(item.color_nombre)}) T${escapeHtml(item.talla)} x${item.cantidad}</td>
          <td style="padding:6px 0;text-align:right;">${currency(item.subtotal)}</td>
        </tr>`
    )
    .join('')

  return `<table style="width:100%;border-collapse:collapse;margin-top:12px;">${rows}</table>`
}

function estadoLabel(estado: PedidoEstado): string {
  switch (estado) {
    case 'pendiente_pago':
      return 'Pendiente'
    case 'pagado':
      return 'Pagado'
    case 'en_preparacion':
      return 'En preparación'
    case 'enviado':
      return 'Enviado'
    case 'entregado':
      return 'Entregado'
    case 'cancelado':
      return 'Cancelado'
    default:
      return estado
  }
}

export async function sendPedidoRecibidoEmail(params: {
  pedido: Pick<
    Pedido,
    | 'numero_pedido'
    | 'email_cliente'
    | 'nombre_cliente'
    | 'telefono'
    | 'dni'
    | 'tipo_envio'
    | 'provincia'
    | 'distrito'
    | 'direccion'
    | 'empresa_envio'
    | 'sede_envio'
    | 'subtotal'
    | 'costo_envio'
    | 'total'
  >
  items: PedidoItemEmail[]
}) {
  const { pedido, items } = params

  const shippingInfo =
    pedido.tipo_envio === 'provincia'
      ? `Provincia (${escapeHtml(pedido.provincia)}): ${escapeHtml(pedido.empresa_envio ?? 'Shalom')} - ${escapeHtml(
          pedido.sede_envio ?? '-'
        )}`
      : `Lima: ${escapeHtml(pedido.distrito ?? '')} ${escapeHtml(pedido.direccion ?? '')}`

  const html = `
    <div style="font-family:Arial,sans-serif;color:#111;line-height:1.5">
      <h2 style="margin-bottom:8px;">Hemos recibido tu pedido ${escapeHtml(pedido.numero_pedido)}</h2>
      <p>Hola ${escapeHtml(pedido.nombre_cliente)}, tu pedido fue registrado correctamente y está <strong>pendiente</strong>.</p>
      <p><strong>Contacto:</strong> ${escapeHtml(pedido.email_cliente)} · ${escapeHtml(pedido.telefono)} · DNI: ${escapeHtml(
    pedido.dni ?? '-'
  )}</p>
      <p><strong>Envío:</strong> ${shippingInfo}</p>
      ${renderPedidoItemsTable(items)}
      <hr style="margin:14px 0;border:none;border-top:1px solid #ddd;" />
      <p>Subtotal: ${currency(pedido.subtotal)}</p>
      <p>Envío: ${currency(pedido.costo_envio)}</p>
      <p><strong>Total: ${currency(pedido.total)}</strong></p>
      <p style="margin-top:16px;">Si tienes dudas, escríbenos por WhatsApp ${escapeHtml(WHATSAPP_NUMBER_DISPLAY)}.</p>
    </div>
  `
  await sendEmail({
    to: pedido.email_cliente,
    subject: `Pedido recibido ${pedido.numero_pedido} - Excusas Jeans`,
    html,
  })
}

export async function sendPedidoEstadoEmail(params: {
  pedido: Pick<Pedido, 'numero_pedido' | 'email_cliente' | 'nombre_cliente' | 'telefono' | 'tipo_envio'>
  estado: PedidoEstado
  comprobanteUrl?: string | null
  items?: PedidoItemEmail[]
}) {
  const { pedido, estado, comprobanteUrl, items = [] } = params
  const trackingNote =
    estado === 'enviado' && pedido.tipo_envio === 'provincia'
      ? `<p>Para hacer seguimiento de tu envío por Shalom, consulta: <a href="${SHALOM_TRACKING_URL}">${SHALOM_TRACKING_URL}</a></p>`
      : ''

  const comprobanteBlock =
    comprobanteUrl && estado === 'enviado'
      ? `<p>Comprobante de envío: <a href="${escapeHtml(comprobanteUrl)}">${escapeHtml(comprobanteUrl)}</a></p>`
      : ''

  const html = `
    <div style="font-family:Arial,sans-serif;color:#111;line-height:1.5">
      <h2 style="margin-bottom:8px;">Actualización de tu pedido ${escapeHtml(pedido.numero_pedido)}</h2>
      <p>Hola ${escapeHtml(pedido.nombre_cliente)}, tu pedido ahora está en estado: <strong>${escapeHtml(
    estadoLabel(estado)
  )}</strong>.</p>
      ${renderPedidoItemsTable(items)}
      ${comprobanteBlock}
      ${trackingNote}
      <p>Si necesitas ayuda, escríbenos por WhatsApp ${escapeHtml(WHATSAPP_NUMBER_DISPLAY)}.</p>
    </div>
  `

  await sendEmail({
    to: pedido.email_cliente,
    subject: `Actualización de pedido ${pedido.numero_pedido}`,
    html,
  })
}

export function buildWhatsAppEstadoUrl(params: {
  telefono: string
  numeroPedido: string
  estado: PedidoEstado
  comprobanteUrl?: string | null
  tipoEnvio: Pedido['tipo_envio']
}): string {
  const digits = params.telefono.replace(/\D/g, '')
  const phone = digits.startsWith('51') ? digits : `51${digits}`
  const trackingText =
    params.estado === 'enviado' && params.tipoEnvio === 'provincia'
      ? `\nTracking Shalom: ${SHALOM_TRACKING_URL}`
      : ''
  const comprobanteText = params.comprobanteUrl
    ? `\nComprobante: ${params.comprobanteUrl}`
    : ''
  const text = encodeURIComponent(
    `Hola, tu pedido ${params.numeroPedido} ahora está ${estadoLabel(params.estado)}.${comprobanteText}${trackingText}`
  )
  return `https://wa.me/${phone}?text=${text}`
}
