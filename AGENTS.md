# Excusas Jeans — Frontend

Stack: **Next.js 15**, **React 19**, **TypeScript**, **Tailwind CSS**.

Backend: **InsForge** (PostgREST + Auth + Storage). El cliente vive en `src/lib/insforge.ts`; `src/lib/supabase.ts` es un adaptador compatible con la API antigua de Supabase.

## Skills (autoskills)

- Instalar/actualizar: `npm run skills:install`
- Sincronizar enlaces para Cursor: `npm run skills:sync-cursor`
- Skills en `.agents/skills/`; Cursor las usa vía `.cursor/skills/` (junctions).

## Convenciones

- Panel admin: `src/app/admin/`, layout `AdminShell`
- Tienda / auth cliente: `/cuenta`, `UserAuthPanel`
- Variables: ver `.env.example` (`NEXT_PUBLIC_INSFORGE_*`, `NEXT_PUBLIC_APP_URL`)
- Schema BD: `insforge-schema.sql` · seguridad RLS: `insforge-security-fix.sql` · emails: `docs/email/`
