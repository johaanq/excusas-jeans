/** Utilidades para agregar métricas del dashboard admin. */

export type DayPoint = {
  key: string
  label: string
  value: number
}

export function getLastNDayKeys(days: number): string[] {
  const keys: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - i)
    keys.push(d.toISOString().slice(0, 10))
  }
  return keys
}

export function dayKeyFromIso(iso: string): string {
  return iso.slice(0, 10)
}

export function formatDayLabel(key: string): string {
  const [y, m, d] = key.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric' })
}

export function buildDailySeries(
  keys: string[],
  valuesByDay: Map<string, number>
): DayPoint[] {
  return keys.map((key) => ({
    key,
    label: formatDayLabel(key),
    value: valuesByDay.get(key) ?? 0,
  }))
}

export function sumByDay<T>(
  items: T[],
  getDate: (item: T) => string | null | undefined,
  getValue: (item: T) => number
): Map<string, number> {
  const map = new Map<string, number>()
  for (const item of items) {
    const raw = getDate(item)
    if (!raw) continue
    const key = dayKeyFromIso(raw)
    map.set(key, (map.get(key) ?? 0) + getValue(item))
  }
  return map
}

export function countByDay<T>(
  items: T[],
  getDate: (item: T) => string | null | undefined
): Map<string, number> {
  return sumByDay(items, getDate, () => 1)
}

export function formatSoles(amount: number): string {
  return `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
