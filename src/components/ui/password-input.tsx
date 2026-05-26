"use client"

import * as React from "react"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export type PasswordInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  wrapperClassName?: string
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, wrapperClassName, value, ...props }, ref) => {
    const [visible, setVisible] = useState(false)
    const hasValue = String(value ?? "").length > 0

    return (
      <div className={cn("relative mt-1.5", wrapperClassName)}>
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          value={value}
          className={cn("h-11 pr-11", className)}
          {...props}
        />
        {hasValue && (
          <button
            type="button"
            tabIndex={-1}
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            onClick={() => setVisible((v) => !v)}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    )
  }
)
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
