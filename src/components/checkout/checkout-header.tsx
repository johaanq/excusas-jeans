import Link from "next/link"
import Image from "next/image"

export function CheckoutHeader() {
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-center px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Excusas Jeans — inicio">
          <div className="relative h-9 w-9">
            <Image
              src="/logo-excusas.png"
              alt=""
              width={36}
              height={36}
              className="object-contain"
              priority
            />
          </div>
          <span className="text-lg font-bold tracking-tight text-stone-900">Excusas</span>
        </Link>
      </div>
    </header>
  )
}
