/** Enlaces principales del header (sin duplicar contacto, legal ni redes del footer). */

export type StoreNavItem = {
  href: string
  label: string
  isActive: (pathname: string) => boolean
}

export const STORE_MAIN_NAV: StoreNavItem[] = [
  {
    href: "/",
    label: "Inicio",
    isActive: (p) => p === "/",
  },
  {
    href: "/catalogo",
    label: "Catálogo",
    isActive: (p) => p === "/catalogo" || p.startsWith("/producto/"),
  },
  {
    href: "/about",
    label: "Nosotros",
    isActive: (p) => p === "/about",
  },
]
