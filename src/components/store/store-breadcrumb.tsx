import Link from "next/link"
import { cn } from "@/lib/utils"

type Crumb = { label: string; href?: string }

type Props = {
  items: Crumb[]
  className?: string
}

export function StoreBreadcrumb({ items, className }: Props) {
  return (
    <nav className={cn("store-breadcrumb", className)} aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="inline-flex items-center gap-1.5">
          {i > 0 && (
            <span className="text-stone-300" aria-hidden>
              /
            </span>
          )}
          {item.href ? (
            <Link href={item.href} className="transition-colors hover:text-stone-900">
              {item.label}
            </Link>
          ) : (
            <span className="text-stone-800">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
