import { DISTRITOS_LIMA } from './peru-locations'

/** Envío hasta agencia (provincia). El flete en destino no está incluido. */
export const SHIPPING_PROVINCIA_AGENCY = 10

/** Delivery en distritos de Lima Metropolitana. */
export const SHIPPING_LIMA_METROPOLITANA = 15

/** Delivery en distritos de Lima Departamento (cono y zonas alejadas). */
export const SHIPPING_LIMA_DEPARTAMENTO = 20

export type TipoEnvio = 'lima' | 'provincia'
export type LimaZona = 'metropolitana' | 'departamento'

/** Distritos con tarifa metropolitana (S/ 15). El resto de Lima usa departamento (S/ 20). */
const LIMA_METROPOLITANA = new Set<string>([
  'Ate',
  'Barranco',
  'Breña',
  'Chorrillos',
  'El Agustino',
  'Jesús María',
  'La Molina',
  'La Victoria',
  'Lince',
  'Magdalena del Mar',
  'Miraflores',
  'Pueblo Libre',
  'Rímac',
  'San Borja',
  'San Isidro',
  'San Luis',
  'San Juan de Miraflores',
  'San Miguel',
  'Santiago de Surco',
  'Surquillo',
])

export function isLimaProvincia(provincia: string): boolean {
  return provincia.trim().toLowerCase() === 'lima'
}

export function getLimaZona(distrito: string): LimaZona | null {
  const d = distrito.trim()
  if (!d) return null
  if (LIMA_METROPOLITANA.has(d)) return 'metropolitana'
  if ((DISTRITOS_LIMA as readonly string[]).includes(d)) return 'departamento'
  return 'departamento'
}

export function getLimaShippingMethodLabel(distrito: string): string {
  const zona = getLimaZona(distrito)
  if (zona === 'metropolitana') return 'Envío Lima Metropolitana'
  return 'Envío Lima Departamento'
}

export function getLimaShippingCost(distrito: string): number {
  const zona = getLimaZona(distrito)
  if (zona === 'metropolitana') return SHIPPING_LIMA_METROPOLITANA
  if (zona === 'departamento') return SHIPPING_LIMA_DEPARTAMENTO
  return SHIPPING_LIMA_METROPOLITANA
}

export function getProvinciaShippingCost(): number {
  return SHIPPING_PROVINCIA_AGENCY
}

export function getProvinciaShippingMethodLabel(): string {
  return 'Envío a agencia Shalom'
}

export function getProvinciaShippingNote(): string {
  return `S/ ${SHIPPING_PROVINCIA_AGENCY.toFixed(2)} por llevar tu pedido hasta la agencia. El flete en destino lo pagas al recoger (no incluido en este pago).`
}

export function getShippingCost(tipoEnvio: TipoEnvio, distrito: string): number {
  if (tipoEnvio === 'provincia') return getProvinciaShippingCost()
  return getLimaShippingCost(distrito)
}
