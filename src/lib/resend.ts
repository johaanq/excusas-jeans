import { Resend } from 'resend'

let client: Resend | null = null

/** Cliente Resend — solo importar desde rutas API o Server Actions (nunca en el cliente). */
export function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error(
      'Falta RESEND_API_KEY. Añádela a .env (re_...) y en Vercel → Environment Variables.'
    )
  }
  if (!client) {
    client = new Resend(apiKey)
  }
  return client
}
