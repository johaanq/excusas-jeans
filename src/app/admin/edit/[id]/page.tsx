import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { getAdminPathFromHeaders } from "@/lib/admin-host"

interface EditPageProps {
  params: Promise<{ id: string }>
}

/** Ruta legacy: abre el modal en la lista de productos */
export default async function EditProductPage({ params }: EditPageProps) {
  const { id } = await params
  const adminPath = getAdminPathFromHeaders(await headers())
  redirect(`${adminPath("/products")}?edit=${encodeURIComponent(id)}`)
}
