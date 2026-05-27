import { NextResponse } from 'next/server'
import {
  WELCOME_DISCOUNT_PERCENT,
  isEligibleForWelcomeDiscount,
} from '@/lib/welcome-discount'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const usuarioId = searchParams.get('usuario_id')
    const email = searchParams.get('email')

    const eligible = await isEligibleForWelcomeDiscount({
      usuarioId,
      email,
    })

    return NextResponse.json({
      eligible,
      percent: eligible ? WELCOME_DISCOUNT_PERCENT : 0,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'No se pudo verificar el descuento'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
