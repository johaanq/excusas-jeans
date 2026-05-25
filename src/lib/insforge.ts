import { createClient } from '@insforge/sdk'

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://xxggjg42.us-east.insforge.app'
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || ''

export const insforge = createClient({
  baseUrl,
  anonKey,
})

export const INSFORGE_BASE_URL = baseUrl

/** True cuando Vercel/build tiene la anon key (evita 401 en SSG). */
export function hasPublicInsforgeKey(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY?.trim())
}
