"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { STORE_MAIN_NAV } from "@/lib/store-nav"

type Props = {
  isScrolled: boolean
  onNavigate?: () => void
  className?: string
  vertical?: boolean
}

export function MainNavLinks({ isScrolled, onNavigate, className, vertical }: Props) {
  const pathname = usePathname()

  return (
    <ul
      className={cn(
        vertical ? "flex flex-col gap-1" : "hidden items-center gap-1 md:flex",
        className
      )}
    >
      {STORE_MAIN_NAV.map((item) => {
        const active = item.isActive(pathname)
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "header-nav-link block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                vertical && "px-0 py-2.5 text-base",
                isScrolled ? "header-nav-link--solid" : "header-nav-link--hero",
                active && "header-nav-link--active"
              )}
            >
              {item.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
