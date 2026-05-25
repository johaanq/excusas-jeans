import { redirect } from "next/navigation"

export default function AuthRegisterRedirect() {
  redirect("/cuenta?tab=register")
}
