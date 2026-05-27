import { NextResponse } from 'next/server'
import { getInsforgeAdmin } from '@/lib/insforge-admin'
import { verifyAdminCredentials } from '@/lib/admin-verify-server'
import type { AdminQueryPayload } from '@/lib/admin-api'

type Body = {
  credentials: { username: string; password: string }
  payload: AdminQueryPayload
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body
    const { credentials, payload } = body

    if (!credentials?.username || !credentials?.password) {
      return NextResponse.json({ error: 'Credenciales requeridas' }, { status: 401 })
    }

    if (!(await verifyAdminCredentials(credentials.username, credentials.password))) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    const admin = getInsforgeAdmin()

    if (payload.op === 'rpc' && payload.rpc) {
      const { data, error } = await admin.database.rpc(payload.rpc, payload.rpcArgs ?? {})
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ data })
    }

    const table = admin.database.from(payload.table)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const applyFilters = (query: any) => {
      let q = query
      if (payload.match) {
        for (const [key, value] of Object.entries(payload.match)) {
          q = q.eq(key, value)
        }
      }
      if (payload.matchIn) {
        for (const [key, values] of Object.entries(payload.matchIn)) {
          if (values.length > 0) {
            q = q.in(key, values)
          }
        }
      }
      return q
    }

    if (payload.op === 'select') {
      let query = applyFilters(table.select(payload.select ?? '*'))
      if (payload.order) {
        query = query.order(payload.order.column, {
          ascending: payload.order.ascending ?? true,
        })
      }
      const result = payload.single ? await query.single() : await query
      if (result.error) {
        return NextResponse.json({ error: result.error.message }, { status: 400 })
      }
      return NextResponse.json({ data: result.data })
    }

    if (payload.op === 'insert') {
      const rows = Array.isArray(payload.data) ? payload.data : [payload.data]
      const result = await table.insert(rows).select(payload.select ?? '*')
      if (result.error) {
        return NextResponse.json({ error: result.error.message }, { status: 400 })
      }
      return NextResponse.json({ data: result.data })
    }

    if (payload.op === 'update') {
      const query = applyFilters(table.update(payload.data as Record<string, unknown>))
      const result = await query.select(payload.select ?? '*')
      if (result.error) {
        return NextResponse.json({ error: result.error.message }, { status: 400 })
      }
      return NextResponse.json({ data: result.data })
    }

    if (payload.op === 'delete') {
      const query = applyFilters(table.delete())
      const result = await query
      if (result.error) {
        return NextResponse.json({ error: result.error.message }, { status: 400 })
      }
      return NextResponse.json({ data: result.data })
    }

    return NextResponse.json({ error: 'Operación no soportada' }, { status: 400 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
