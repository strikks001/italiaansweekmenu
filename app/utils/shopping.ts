import type { ReceptenCollectionItem } from '@nuxt/content'

export interface ShoppingItem {
  key: string
  naam: string
  eenheid: string
  /** Summed where the amounts are numbers, otherwise the raw amounts joined. */
  hoeveelheid: string
  /** Which recipes need it, so you can drop one dish and still read the list. */
  recepten: string[]
  productUrl?: string
}

/**
 * Seasoning is written a dozen ways, so each spelling would become its own
 * line. Collapsed to one entry without an amount; one line can name several.
 */
const SEASONING = [
  { naam: 'zout', patroon: /zout/ },
  { naam: 'peper', patroon: /\bpeper\b/ },
  { naam: 'nootmuskaat', patroon: /nootmuskaat/ }
]

/** Lowercase without accents, so "Ragù" and "ragu" merge. */
const normalise = (text: string) =>
  text.toLowerCase().trim().normalize('NFD').replace(/[̀-ͯ]/g, '')

/** "winterwortels" -> "winterwortel". Only used to pair the two spellings. */
const singular = (naam: string) => naam.replace(/(?:s|en)$/, '')

/**
 * Two lines can still be one product after the merge above:
 *
 * - A plural. "1 winterwortel" and "2 winterwortels" are both correct Dutch
 *   for their own amount, but they never meet on the name. Folded only when
 *   the word really is a plural and the singular occurs too, so a word that
 *   merely ends in -s cannot be mangled.
 * - A line with neither amount nor unit, such as oil to finish with. It adds
 *   no number, so it belongs with the amount that is already there.
 *
 * Units still keep lines apart: a rind of Parmigiano is not 1 gram of it.
 */
function mergeLeftovers(items: Map<string, Entry>) {
  const byName = new Map<string, Entry>()
  for (const entry of items.values()) {
    const naam = normalise(entry.naam)
    const held = byName.get(naam)
    if (!held || entry.sum > held.sum) byName.set(naam, entry)
  }

  for (const [key, entry] of items) {
    const naam = normalise(entry.naam)
    const stam = singular(naam)

    const target = stam !== naam
      ? byName.get(stam)
      : !entry.eenheid && !entry.sum && !entry.loose.length
          ? byName.get(naam)
          : undefined

    if (!target || target === entry) continue

    // The plural belongs to the larger amount, and after adding up that is
    // this entry more often than not.
    if (entry.sum > target.sum) target.naam = entry.naam

    target.sum += entry.sum
    target.loose.push(...entry.loose)
    for (const recept of entry.recepten) {
      if (!target.recepten.includes(recept)) target.recepten.push(recept)
    }
    target.productUrl ??= entry.productUrl
    items.delete(key)
  }
}

/**
 * Merged per name *and* unit: 200 g and 2 stuks cannot be added up, so they
 * stay separate lines rather than becoming a wrong number.
 */
type Entry = ShoppingItem & { sum: number, loose: string[] }

export function buildShoppingList(recipes: ReceptenCollectionItem[]): ShoppingItem[] {
  const items = new Map<string, Entry>()

  function add(
    naam: string,
    eenheid: string,
    hoeveelheid: string | undefined,
    recipeTitle: string,
    productUrl?: string
  ) {
    const key = `${normalise(naam)}|${normalise(eenheid)}`

    const entry = items.get(key) ?? {
      key, naam, eenheid, hoeveelheid: '', recepten: [], productUrl, sum: 0, loose: []
    }

    const amount = hoeveelheid ? parseQuantity(hoeveelheid) : Number.NaN
    if (Number.isFinite(amount)) entry.sum += amount
    else if (hoeveelheid) entry.loose.push(hoeveelheid)

    if (!entry.recepten.includes(recipeTitle)) entry.recepten.push(recipeTitle)
    entry.productUrl ??= productUrl

    items.set(key, entry)
  }

  for (const recipe of recipes) {
    for (const group of recipe.ingredienten) {
      for (const item of group.items) {
        const staples = SEASONING.filter(s => s.patroon.test(normalise(item.naam)))

        if (staples.length) {
          for (const staple of staples) add(staple.naam, '', undefined, recipe.title)
        } else {
          add(item.naam, item.eenheid ?? '', item.hoeveelheid, recipe.title, item.productUrl)
        }
      }
    }
  }

  mergeLeftovers(items)

  return [...items.values()]
    .map(({ sum, loose, ...item }) => ({
      ...item,
      hoeveelheid: [sum > 0 ? formatQuantity(sum) : '', ...loose].filter(Boolean).join(' + ')
    }))
    .sort((a, b) => a.naam.localeCompare(b.naam, 'nl'))
}
