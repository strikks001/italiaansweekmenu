/**
 * Zet minuten om naar een ISO 8601-duur, bijv. 95 -> "PT1H35M".
 * Google vereist dit formaat in schema.org Recipe (prepTime/cookTime/totalTime).
 */
export function isoDuur(minuten: number): string {
  if (!minuten || minuten < 1) return 'PT0M'
  const uren = Math.floor(minuten / 60)
  const rest = minuten % 60
  return `PT${uren ? `${uren}H` : ''}${rest ? `${rest}M` : ''}`
}

/** Leesbare variant voor op de pagina zelf, bijv. 95 -> "1 uur 35 min". */
export function leesbareDuur(minuten: number): string {
  if (!minuten || minuten < 1) return '-'
  const uren = Math.floor(minuten / 60)
  const rest = minuten % 60
  if (!uren) return `${rest} min`
  if (!rest) return `${uren} uur`
  return `${uren} uur ${rest} min`
}
