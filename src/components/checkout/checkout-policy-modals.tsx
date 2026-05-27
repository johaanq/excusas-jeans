"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from "@/components/ui/dialog"
import {
  CHECKOUT_POLICIES,
  CHECKOUT_POLICY_LINKS,
  type CheckoutPolicyId,
} from "@/lib/checkout-policies"

export function CheckoutPolicyModals() {
  const [openId, setOpenId] = useState<CheckoutPolicyId | null>(null)
  const policy = openId ? CHECKOUT_POLICIES[openId] : null

  return (
    <>
      <p className="mt-4 flex flex-wrap justify-center gap-x-3 gap-y-2 text-center text-xs text-stone-500">
        {CHECKOUT_POLICY_LINKS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className="underline-offset-4 hover:text-stone-800 hover:underline"
            onClick={() => setOpenId(id)}
          >
            {label}
          </button>
        ))}
      </p>

      <Dialog open={openId != null} onOpenChange={(open) => !open && setOpenId(null)}>
        {policy && (
          <DialogContent className="max-w-lg rounded-2xl sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-stone-900">
                {policy.title}
              </DialogTitle>
              <p className="text-xs text-stone-500">Actualizado: {policy.updatedAt}</p>
            </DialogHeader>
            <DialogBody className="space-y-4 text-sm leading-relaxed text-stone-700">
              {policy.sections.map((section, i) => (
                <div key={i}>
                  {section.heading && (
                    <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-stone-900">
                      {section.heading}
                    </p>
                  )}
                  {section.paragraphs.map((p, j) => (
                    <p key={j} className={j > 0 ? "mt-2" : undefined}>
                      {p}
                    </p>
                  ))}
                </div>
              ))}
            </DialogBody>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}
