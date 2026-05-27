import { NextResponse } from 'next/server'
import {
  getLimaShippingCost,
  getLimaShippingMethodLabel,
  getLimaZona,
  getProvinciaShippingCost,
  getProvinciaShippingMethodLabel,
  getProvinciaShippingNote,
  isLimaProvincia,
} from '@/lib/shipping'

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
        metodo: null,
        lima_zona: null,
        mensaje: 'Selecciona tu distrito para ver el método y costo de envío.',
      })
    }
    const costo = getLimaShippingCost(distrito)
    const zona = getLimaZona(distrito)
    const metodo = getLimaShippingMethodLabel(distrito)
    const plazo = zona === 'metropolitana' ? 'Entrega en 24–48 h' : 'Entrega en 48–72 h'
    return NextResponse.json({
      tipo_envio: 'lima',
      costo_envio: costo,
      metodo,
      lima_zona: zona,
      mensaje: `${metodo} · ${plazo}`,
    })
  }

  const costo = getProvinciaShippingCost()
  return NextResponse.json({
    tipo_envio: 'provincia',
    costo_envio: costo,
    metodo: getProvinciaShippingMethodLabel(),
    lima_zona: null,
    mensaje: getProvinciaShippingNote(),
  })
}
