/**
 * Opcional: reescribe el src del logo en confirmation.html.
 * Por defecto usa URL pública (Gmail no muestra bien base64 embebido).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const logoUrl =
  process.env.EMAIL_LOGO_URL || 'https://excusasjeans.com/logo-excusas.png'
const htmlPath = path.join(root, 'docs/email/confirmation.html')
let html = fs.readFileSync(htmlPath, 'utf8')

const imgTag = `<img
                src="${logoUrl}"
                alt="Excusas Jeans"
                width="56"
                height="56"
                style="display:block;width:56px;height:56px;border:0;margin:0 auto;"
              />`

html = html.replace(/<img[\s\S]*?\/>\s*(?=<p style="margin:12px)/, imgTag + '\n              ')

fs.writeFileSync(htmlPath, html)
console.log(`Logo URL actualizado: ${logoUrl}`)
