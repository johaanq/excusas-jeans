"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from "@/components/ui/dialog"
import { ProductEditForm } from "@/components/admin/product-edit-form"

type Props = {
  open: boolean
  productId: string | null
  onOpenChange: (open: boolean) => void
  onUpdated?: () => void
}

export function ProductEditModal({ open, productId, onOpenChange, onUpdated }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Editar producto</DialogTitle>
          <DialogDescription>
            Modifica datos, tallas, colores e imágenes del catálogo.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {open && productId ? (
            <ProductEditForm
              key={productId}
              productId={productId}
              embedded
              onSuccess={() => {
                onUpdated?.()
                onOpenChange(false)
              }}
              onCancel={() => onOpenChange(false)}
            />
          ) : null}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
