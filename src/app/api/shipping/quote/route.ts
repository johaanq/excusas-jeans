import { NextResponse } from 'next/server'
import { getLimaShippingCost, getProvinciaShippingNote, isLimaProvincia } from '@/lib/shipping'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const provincia = searchParams.get('provincia') ?? ''
  const distrito = searchParams.get('distrito') ?? ''

  if (!provincia.trim()) {
    return NextResponse.json({ error: 'Provincia requerida' }, { status: 400 })
  }

  if (isLimaProvincia(provincia)) {
    if (!distrito.trim()) {
      return NextResponse.json({
        tipo_envio: 'lima',
        costo_envio: null,
        mensaje: 'Selecciona tu distrito para ver el costo de envío en Lima.',
      })
    }
    const costo = getLimaShippingCost(distrito)
    return NextResponse.json({
      tipo_envio: 'lima',
      costo_envio: costo,
      mensaje: `Envío a ${distrito}: S/ ${costo.toFixed(2)}`,
    })
  }

  return NextResponse.json({
    tipo_envio: 'provincia',
    costo_envio: 0,
    mensaje: getProvinciaShippingNote(),
  })
}
