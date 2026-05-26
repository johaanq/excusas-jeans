import { Plus_Jakarta_Sans } from "next/font/google"

/** Tipografía única de la tienda Excusas Jeans */
export const brandFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-brand",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})
