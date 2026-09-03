/**
 * Scales a recipe quantity by a factor.
 * Quantities are strings: besides "250" a recipe holds "1,5", "2-3" and
 * "een snuf". Only parseable numbers are scaled; anything else passes through.
 */
export function scaleQuantity(quantity: string | undefined, factor: number): string {
  if (!quantity) return ''
  if (factor === 1) return quantity

  const text = quantity.trim()

  const range = text.match(/^(\d+(?:[.,]\d+)?)\s*-\s*(\d+(?:[.,]\d+)?)$/)
  if (range) {
    return `${formatQuantity(parseQuantity(range[1]!) * factor)}-${formatQuantity(parseQuantity(range[2]!) * factor)}`
  }

  const single = text.match(/^(\d+(?:[.,]\d+)?)(.*)$/)
  if (single) {
    return `${formatQuantity(parseQuantity(single[1]!) * factor)}${single[2]}`
  }

  return quantity
}

/** Parses a Dutch quantity string; NaN when it is not a number. */
export function parseQuantity(value: string): number {
  return Number.parseFloat(value.replace(',', '.'))
}

/** Rounds to something measurable in a kitchen, with a Dutch decimal comma. */
export function formatQuantity(value: number): string {
  if (!Number.isFinite(value)) return ''

  let rounded: number
  if (value >= 50) rounded = Math.round(value / 5) * 5
  else if (value >= 10) rounded = Math.round(value)
  else rounded = Math.round(value * 2) / 2

  return String(rounded).replace('.', ',')
}

/** Rounds up: formatQuantity rounds to the nearest half, which on a sum turned
 *  1,5 l + 1,2 l into 2,5 l and left you short. */
export function formatTotal(value: number): string {
  if (!Number.isFinite(value)) return ''

  const rounded = Math.ceil(value * 10 - 1e-9) / 10
  return String(rounded).replace('.', ',')
}
