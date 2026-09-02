/**
 * The courses of an Italian meal, in the order they reach the table. Also the
 * folder names under content/recepten: a recipe in a folder that is not here
 * is not in the collection, and disappears from the site without an error.
 *
 * `piatto unico` is the one-plate meal that replaces primo and secondo - pizza,
 * lasagne, a lunch dish. Hyphenated here because it doubles as a folder name.
 */
export const GANGEN = [
  'antipasto', 'primo', 'secondo', 'contorno', 'piatto-unico', 'dolce', 'basis'
] as const

export type Gang = typeof GANGEN[number]

/** Only the hyphenated one needs a label; the rest reads as it is written. */
const LABELS: Partial<Record<Gang, string>> = {
  'piatto-unico': 'piatto unico'
}

export function gangLabel(gang: string): string {
  return LABELS[gang as Gang] ?? gang
}
