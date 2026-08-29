/** Minutes to ISO 8601 duration, e.g. 95 -> "PT1H35M". Required by schema.org Recipe. */
export function isoDuration(minutes: number): string {
  if (!minutes || minutes < 1) return 'PT0M'
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return `PT${hours ? `${hours}H` : ''}${rest ? `${rest}M` : ''}`
}

/** Human readable duration in Dutch, e.g. 95 -> "1 uur 35 min". */
export function readableDuration(minutes: number): string {
  if (!minutes || minutes < 1) return '-'
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (!hours) return `${rest} min`
  if (!rest) return `${hours} uur`
  return `${hours} uur ${rest} min`
}
