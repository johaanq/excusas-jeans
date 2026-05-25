import { redirect } from "next/navigation"

type Props = {
  searchParams: Promise<{ message?: string; redirect?: string }>
}

export default async function AuthLoginRedirect({ searchParams }: Props) {
  const params = await searchParams
  const query = new URLSearchParams()
  query.set("tab", "login")
  if (params.message) query.set("message", params.message)
  if (params.redirect) query.set("redirect", params.redirect)
  redirect(`/cuenta?${query.toString()}`)
}
