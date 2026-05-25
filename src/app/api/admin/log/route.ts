import { NextResponse } from 'next/server'
import { getInsforgeAdmin } from '@/lib/insforge-admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { adminId, action, description, resourceType, resourceId, userAgent, metadata } = body

    if (!adminId || !action) {
      return NextResponse.json({ error: 'adminId y action son requeridos' }, { status: 400 })
    }

    const admin = getInsforgeAdmin()
    const { data, error } = await admin.database.rpc('registrar_admin_log', {
      p_admin_id: adminId,
      p_action: action,
      p_description: description ?? null,
      p_resource_type: resourceType ?? null,
      p_resource_id: resourceId ?? null,
      p_ip_address: null,
      p_user_agent: userAgent ?? null,
      p_metadata: metadata ?? null,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
