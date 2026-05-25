/**
 * Cliente compatible con la API previa de Supabase, respaldado por InsForge.
 */
import { insforge, INSFORGE_BASE_URL } from './insforge'

const authAdapter = {
  async signUp(params: {
    email: string
    password: string
    options?: { data?: { nombre?: string } }
  }) {
    const nombre = params.options?.data?.nombre
    const origin =
      typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || ''
    return insforge.auth.signUp({
      email: params.email,
      password: params.password,
      name: nombre,
      redirectTo: origin ? `${origin}/cuenta` : undefined,
    })
  },

  async signInWithPassword(params: { email: string; password: string }) {
    const result = await insforge.auth.signInWithPassword(params)
    if (result.data) {
      return {
        data: {
          user: result.data.user,
          session: { access_token: result.data.accessToken },
        },
        error: result.error,
      }
    }
    return { data: null, error: result.error }
  },

  async signOut() {
    return insforge.auth.signOut()
  },

  async getUser() {
    const { data, error } = await insforge.auth.getCurrentUser()
    return { data: { user: data?.user ?? null }, error }
  },

  onAuthStateChange(
    _callback: (event: string, session: { user?: { id: string }; access_token?: string } | null) => void
  ) {
    return { data: { subscription: { unsubscribe: () => {} } } }
  },
}

function createStorageBucket(bucket: string) {
  return {
    async upload(path: string, file: File) {
      const { data, error } = await insforge.storage.from(bucket).upload(path, file)
      if (error) {
        return { data: null, error: { message: error.message } }
      }
      return {
        data: { path: data?.key ?? path },
        error: null,
      }
    },

    getPublicUrl(path: string) {
      const encoded = path.split('/').map(encodeURIComponent).join('/')
      const publicUrl = `${INSFORGE_BASE_URL}/api/storage/buckets/${bucket}/objects/${encoded}`
      return { data: { publicUrl } }
    },

    async remove(paths: string[]) {
      for (const path of paths) {
        const { error } = await insforge.storage.from(bucket).remove(path)
        if (error) {
          return { error: { message: error.message } }
        }
      }
      return { error: null }
    },
  }
}

export const supabase = {
  from: (table: string) => insforge.database.from(table),
  rpc: (fn: string, args?: Record<string, unknown>) => insforge.database.rpc(fn, args),
  auth: authAdapter,
  storage: {
    from: (bucket: string) => createStorageBucket(bucket),
  },
}
