"use client"

import Script from "next/script"
import { useCallback, useState, type ReactNode } from "react"

export type CulqiPaySession = {
  pedido_id: string
  numero_pedido: string
  amount_cents: number
  public_key: string
  email: string
}

declare global {
  interface Window {
    Culqi?: {
      publicKey?: string
      token?: { id: string }
      error?: { user_message?: string }
      settings: (opts: { title: string; currency: string; amount: number }) => void
      options: (opts: {
        paymentMethods: {
          tarjeta: boolean
          yape: boolean
          billetera: boolean
          cuotealo: boolean
        }
      }) => void
      open: () => void
    }
    culqi?: () => void
  }
}

type Props = {
  onPrepare: () => Promise<CulqiPaySession>
  onToken: (tokenId: string, session: CulqiPaySession) => Promise<void>
  disabled?: boolean
  children: (props: { pay: () => void; loading: boolean; ready: boolean }) => ReactNode
}

export function CulqiCheckoutButton({ onPrepare, onToken, disabled, children }: Props) {
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)

  const pay = useCallback(async () => {
    if (!window.Culqi || disabled) return
    setLoading(true)
    try {
      const session = await onPrepare()
      const Culqi = window.Culqi
      Culqi.publicKey = session.public_key
      Culqi.settings({
        title: "Excusas Jeans",
        currency: "PEN",
        amount: session.amount_cents,
      })
      Culqi.options({
        paymentMethods: {
          tarjeta: true,
          yape: true,
          billetera: true,
          cuotealo: false,
        },
      })

      window.culqi = async () => {
        if (Culqi.token?.id) {
          setLoading(true)
          try {
            await onToken(Culqi.token.id, session)
          } finally {
            setLoading(false)
          }
        }
      }

      Culqi.open()
    } finally {
      setLoading(false)
    }
  }, [disabled, onPrepare, onToken])

  return (
    <>
      <Script
        src="https://checkout.culqi.com/js/v3"
        strategy="lazyOnload"
        onLoad={() => setReady(true)}
      />
      {children({ pay, loading, ready })}
    </>
  )
}
