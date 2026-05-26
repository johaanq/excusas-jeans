import { DISTRITOS_LIMA } from './peru-locations'

/** Tarifas referenciales de delivery en Lima (soles). Ajustables en este archivo. */
const LIMA_DISTRITO_TARIFA: Partial<Record<string, number>> = {
  Miraflores: 12,
  'San Isidro': 12,
  Barranco: 12,
  'Santiago de Surco': 12,
  'La Molina': 14,
  'San Borja': 12,
  'Jesús María': 12,
  Lince: 12,
  'Pueblo Libre': 12,
  Surquillo: 12,
  Magdalena: 12,
  'Magdalena del Mar': 12,
  'San Miguel': 12,
  Breña: 14,
  Comas: 16,
  'Los Olivos': 16,
  'San Juan de Lurigancho': 16,
  'Villa El Salvador': 18,
  'Villa María del Triunfo': 18,
  Chorrillos: 14,
  'San Juan de Miraflores': 14,
  Ate: 16,
  'Santa Anita': 16,
  Carabayllo: 18,
  'Puente Piedra': 18,
  Lurín: 20,
  Pachacámac: 20,
}

const LIMA_TARIFA_DEFAULT = 15

export type TipoEnvio = 'lima' | 'provincia'

export function isLimaProvincia(provincia: string): boolean {
  return provincia.trim().toLowerCase() === 'lima'
}

/** Envío a provincia vía web: solo producto; flete Shalom lo paga el cliente en agencia. */
export function getProvinciaShippingNote(): string {
  return 'El costo de envío a provincia (Shalom) no está incluido en el pago online. Lo pagas al recoger en la agencia.'
}

export function getLimaShippingCost(distrito: string): number {
  const d = distrito.trim()
  if (!d) return LIMA_TARIFA_DEFAULT
  if (LIMA_DISTRITO_TARIFA[d] != null) return LIMA_DISTRITO_TARIFA[d]!
  if (!(DISTRITOS_LIMA as readonly string[]).includes(d)) return LIMA_TARIFA_DEFAULT
  return LIMA_TARIFA_DEFAULT
}

export function getShippingCost(tipoEnvio: TipoEnvio, distrito: string): number {
  if (tipoEnvio === 'provincia') return 0
  return getLimaShippingCost(distrito)
}
