/** Cliente servidor Culqi API v2 */

const CULQI_API = 'https://api.culqi.com/v2'

export function getCulqiPublicKey(): string {
  const key = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY
  if (!key) throw new Error('NEXT_PUBLIC_CULQI_PUBLIC_KEY no está configurada')
  return key
}

function getCulqiSecretKey(): string {
  const key = process.env.CULQI_SECRET_KEY
  if (!key) throw new Error('CULQI_SECRET_KEY no está configurada')
  return key
}

/** Monto en céntimos de sol: S/ 10.50 → 1050 */
export function solesToCulqiAmount(soles: number): number {
  return Math.round(soles * 100)
}

export type CulqiChargeResponse = {
  id?: string
  object?: string
  amount?: number
  outcome?: { type?: string; user_message?: string }
  user_message?: string
}

export async function createCulqiCharge(params: {
  amountCents: number
  email: string
  sourceId: string
  pedidoId: string
  numeroPedido: string
}): Promise<CulqiChargeResponse> {
  const res = await fetch(`${CULQI_API}/charges`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getCulqiSecretKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: params.amountCents,
      currency_code: 'PEN',
      email: params.email,
      source_id: params.sourceId,
      description: `Pedido ${params.numeroPedido}`,
      metadata: {
        pedido_id: params.pedidoId,
        numero_pedido: params.numeroPedido,
      },
    }),
  })

  const data = (await res.json()) as CulqiChargeResponse & {
    merchant_message?: string
  }

  if (!res.ok) {
    const msg =
      data.user_message ||
      data.merchant_message ||
      data.outcome?.user_message ||
      'No se pudo procesar el pago'
    throw new Error(msg)
  }

  if (data.outcome?.type && data.outcome.type !== 'venta_exitosa') {
    throw new Error(data.outcome.user_message || 'El pago no fue aprobado')
  }

  return data
}

export async function getCulqiCharge(chargeId: string): Promise<CulqiChargeResponse> {
  const res = await fetch(`${CULQI_API}/charges/${chargeId}`, {
    headers: { Authorization: `Bearer ${getCulqiSecretKey()}` },
  })
  const data = (await res.json()) as CulqiChargeResponse
  if (!res.ok) throw new Error('Cargo no encontrado en Culqi')
  return data
}
