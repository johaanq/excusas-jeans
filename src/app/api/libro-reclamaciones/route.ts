import { NextResponse } from 'next/server'
import { getInsforgeAdmin } from '@/lib/insforge-admin'

type Body = {
  tipo_documento: 'reclamo' | 'queja'
  nombres_apellidos: string
  tipo_doc_identidad: string
  numero_doc_identidad: string
  domicilio: string
  telefono: string
  email: string
  es_menor_edad?: boolean
  nombre_padre_tutor?: string
  bien_contratado: string
  monto_reclamado?: number | null
  descripcion: string
  pedido_consumidor: string
  detalle_pedido?: string
}

function generateNumeroHoja(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const r = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `LR-${y}${m}${day}-${r}`
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body

    if (!body.tipo_documento || !['reclamo', 'queja'].includes(body.tipo_documento)) {
      return NextResponse.json({ error: 'Indica si es reclamo o queja' }, { status: 400 })
    }
    if (!body.nombres_apellidos?.trim()) {
      return NextResponse.json({ error: 'Nombres y apellidos requeridos' }, { status: 400 })
    }
    if (!body.numero_doc_identidad?.trim()) {
      return NextResponse.json({ error: 'Documento de identidad requerido' }, { status: 400 })
    }
    if (!body.domicilio?.trim() || !body.telefono?.trim() || !body.email?.trim()) {
      return NextResponse.json({ error: 'Domicilio, teléfono y correo son obligatorios' }, { status: 400 })
    }
    if (!body.bien_contratado?.trim() || !body.descripcion?.trim() || !body.pedido_consumidor?.trim()) {
      return NextResponse.json({ error: 'Completa la descripción del reclamo o queja' }, { status: 400 })
    }
    if (body.es_menor_edad && !body.nombre_padre_tutor?.trim()) {
      return NextResponse.json({ error: 'Indica el nombre del padre o tutor' }, { status: 400 })
    }

    const admin = getInsforgeAdmin()
    const numero_hoja = generateNumeroHoja()

    const { data, error } = await admin.database
      .from('libro_reclamaciones')
      .insert({
        numero_hoja,
        tipo_documento: body.tipo_documento,
        nombres_apellidos: body.nombres_apellidos.trim(),
        tipo_doc_identidad: body.tipo_doc_identidad,
        numero_doc_identidad: body.numero_doc_identidad.trim(),
        domicilio: body.domicilio.trim(),
        telefono: body.telefono.trim(),
        email: body.email.trim(),
        es_menor_edad: Boolean(body.es_menor_edad),
        nombre_padre_tutor: body.nombre_padre_tutor?.trim() || null,
        bien_contratado: body.bien_contratado.trim(),
        monto_reclamado: body.monto_reclamado ?? null,
        descripcion: body.descripcion.trim(),
        pedido_consumidor: body.pedido_consumidor.trim(),
        detalle_pedido: body.detalle_pedido?.trim() || null,
      })
      .select('numero_hoja, fecha_registro')
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? 'No se pudo registrar la hoja de reclamación' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      numero_hoja: data.numero_hoja,
      fecha_registro: data.fecha_registro,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al registrar'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
