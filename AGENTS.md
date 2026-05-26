# Excusas Jeans — Frontend

Stack: **Next.js 15**, **React 19**, **TypeScript**, **Tailwind CSS**.

Backend: **InsForge** (PostgREST + Auth + Storage). SDK en `src/lib/insforge.ts`; cliente de app (auth, queries, storage) en `src/lib/insforge-client.ts`.

## Skills (autoskills)

- Instalar/actualizar: `npm run skills:install`
- Sincronizar enlaces para Cursor: `npm run skills:sync-cursor`
- Skills en `.agents/skills/`; Cursor las usa vía `.cursor/skills/` (junctions).

## Convenciones

- Panel admin: `src/app/admin/`, layout `AdminShell`
- Tienda / auth cliente: `/cuenta`, `UserAuthPanel`
- Variables: ver `.env.example` (`NEXT_PUBLIC_INSFORGE_*`, `NEXT_PUBLIC_APP_URL`)
- Schema BD: `insforge-schema.sql` · seguridad RLS: `insforge-security-fix.sql` · plantillas email HTML: `docs/email/*.html`
