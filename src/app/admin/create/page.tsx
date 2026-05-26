import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { getAdminPathFromHeaders } from "@/lib/admin-host"

export default async function CreateProductPage() {
  const adminPath = getAdminPathFromHeaders(await headers())
  redirect(adminPath("/products"))
}
