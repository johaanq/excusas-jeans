import { getResend } from './resend'

export type SendEmailParams = {
  to: string | string[]
  subject: string
  html: string
  /** Por defecto RESEND_FROM o onboarding@resend.dev (solo pruebas en Resend). */
  from?: string
}

/**
 * Envía un correo transaccional vía Resend.
 * Uso: rutas en `src/app/api/...` o Server Actions.
 */
export async function sendEmail(params: SendEmailParams) {
  const from =
    params.from ??
    process.env.RESEND_FROM ??
    'Excusas Jeans <onboarding@resend.dev>'

  const resend = getResend()
  const { data, error } = await resend.emails.send({
    from,
    to: params.to,
    subject: params.subject,
    html: params.html,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}
