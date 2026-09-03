/** Also the folder names under content/recepten: a folder missing here drops
 *  its recipes from the collection without an error. */
export const GANGEN = [
  'antipasto', 'primo', 'secondo', 'contorno', 'piatto-unico', 'dolce', 'basis'
] as const

export type Gang = typeof GANGEN[number]

const LABELS: Partial<Record<Gang, string>> = {
  'piatto-unico': 'piatto unico'
}

export function gangLabel(gang: string): string {
  return LABELS[gang as Gang] ?? gang
}
