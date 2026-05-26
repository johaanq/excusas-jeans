"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from "@/components/ui/dialog"
import { ProductForm } from "@/components/admin/product-form"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
}

export function ProductCreateModal({ open, onOpenChange, onCreated }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Nuevo producto</DialogTitle>
          <DialogDescription>
            Completa los datos, tallas, colores e imágenes. Se publicará como activo.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {open && (
            <ProductForm
              embedded
              onSuccess={() => {
                onCreated?.()
                onOpenChange(false)
              }}
              onCancel={() => onOpenChange(false)}
            />
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
