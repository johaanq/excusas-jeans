import { cn } from "@/lib/utils"

type StorePageProps = {
  children: React.ReactNode
  className?: string
}

/** Contenedor estándar de páginas de la tienda */
export function StorePage({ children, className }: StorePageProps) {
  return <div className={cn("store-container pb-12 md:pb-16", className)}>{children}</div>
}

type StorePageHeaderProps = {
  eyebrow?: string
  title: string
  description?: string
  className?: string
}

export function StorePageHeader({ eyebrow, title, description, className }: StorePageHeaderProps) {
  return (
    <header className={cn("mb-8 md:mb-10", className)}>
      {eyebrow && <p className="store-kicker">{eyebrow}</p>}
      <h1 className="store-title mt-1">{title}</h1>
      {description && <p className="store-lead mt-2">{description}</p>}
    </header>
  )
}
