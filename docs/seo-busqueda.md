# SEO — aparecer en Google, Brave, Bing (excusasjeans.com)

## Ya configurado en el código

- Metadatos con palabras clave: excusas jeans, excusas, jeans, excusas-jeans, excusasjeans.com
- URL canónica y `metadataBase` desde `NEXT_PUBLIC_APP_URL`
- `robots.txt` y `sitemap.xml` automáticos
- Datos estructurados JSON-LD (Organization, WebSite, ClothingStore, Product)
- Páginas privadas (`/admin`, `/login`, `/cuenta`) con `noindex`

## Si `/sitemap.xml` da 404 en producción

Significa que **aún no está desplegada** la versión nueva del código. En Vercel:

1. **Deployments** → último commit → **Redeploy** (o `git push` si conectaste GitHub).
2. Confirma **Root Directory** = `excusas-jeans-frontend` (si el repo es la carpeta padre).
3. Tras el deploy, abre `https://excusasjeans.com/sitemap.xml` (debe verse XML, no 404).

Hay copia estática en `public/sitemap.xml` por si el generador dinámico falla.

## Pasos obligatorios (fuera del código)

### 1. Variable de entorno en producción (Vercel)

```
NEXT_PUBLIC_APP_URL=https://excusasjeans.com
```

### 2. Google Search Console

1. Entra en [search.google.com/search-console](https://search.google.com/search-console)
2. Añade la propiedad **excusasjeans.com**
3. Verifica el dominio (DNS TXT en tu registrador o meta tag en `.env` como `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`)
4. Menú **Sitemaps** → envía: `https://excusasjeans.com/sitemap.xml`

### 3. Bing Webmaster Tools

1. [bing.com/webmasters](https://www.bing.com/webmasters) — importa desde Google o añade el sitio manualmente
2. Envía el mismo sitemap

### 4. Brave / otros

Brave Search usa principalmente el índice de Bing y Google; no requiere panel propio si los dos anteriores están bien.

## Tiempo de indexación

- Puede tardar **días o semanas** en posicionar “excusas jeans” frente a otras páginas con el mismo nombre
- Publica contenido estable, enlaces desde Instagram/WhatsApp al dominio **excusasjeans.com** (no solo Vercel)
- Mantén el catálogo con productos activos para que el sitemap tenga URLs útiles

## Comprobar

- `https://excusasjeans.com/robots.txt`
- `https://excusasjeans.com/sitemap.xml`
- [Rich Results Test](https://search.google.com/test/rich-results) con la home
