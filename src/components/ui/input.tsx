import * as React from "react"
import { cn } from "@/lib/utils"

/** Clases visibles para formularios (borde gris sobre fondo blanco). */
export const formInputClassName =
  "border-gray-300 bg-white text-gray-900 shadow-sm placeholder:text-gray-400 focus-visible:border-emerald-700 focus-visible:ring-emerald-700/20"

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
          formInputClassName,
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
