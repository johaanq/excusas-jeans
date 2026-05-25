import { createClient } from '@insforge/sdk'

export function getInsforgeAdmin() {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL
  const adminKey = process.env.INSFORGE_ADMIN_API_KEY

  if (!baseUrl || !adminKey) {
    throw new Error('Faltan NEXT_PUBLIC_INSFORGE_URL o INSFORGE_ADMIN_API_KEY')
  }

  return createClient({
    baseUrl,
    anonKey: adminKey,
  })
}
