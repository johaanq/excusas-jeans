import { getInsforgeAdmin } from '@/lib/insforge-admin'

export async function verifyAdminCredentials(
  username: string,
  password: string
): Promise<boolean> {
  const admin = getInsforgeAdmin()
  const { data, error } = await admin.database.rpc('verificar_admin_credenciales', {
    p_username: username,
    p_password: password,
  })
  return !error && Array.isArray(data) && data.length > 0
}
