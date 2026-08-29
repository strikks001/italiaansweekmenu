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
    return `${format(parse(range[1]!) * factor)}-${format(parse(range[2]!) * factor)}`
  }

  // Single number, optionally followed by a suffix we keep intact.
  const single = text.match(/^(\d+(?:[.,]\d+)?)(.*)$/)
  if (single) {
    return `${format(parse(single[1]!) * factor)}${single[2]}`
  }

  return quantity
}

function parse(value: string): number {
  return Number.parseFloat(value.replace(',', '.'))
}

/** Rounds to something measurable in a kitchen, with a Dutch decimal comma. */
function format(value: number): string {
  if (!Number.isFinite(value)) return ''

  let rounded: number
  if (value >= 50) rounded = Math.round(value / 5) * 5
  else if (value >= 10) rounded = Math.round(value)
  else rounded = Math.round(value * 2) / 2

  return String(rounded).replace('.', ',')
}
