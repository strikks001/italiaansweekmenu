import type { ReceptenCollectionItem } from '@nuxt/content'

export interface ShoppingItem {
  key: string
  naam: string
  eenheid: string
  /** Summed where the amounts are numbers, otherwise the raw amounts joined. */
  hoeveelheid: string
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

/** Folds a plural into its singular, and an amountless line into the amount
 *  that is already there. Units still keep lines apart. */
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

/** Merged per name *and* unit: 200 g and 2 stuks cannot be added up. */
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
      hoeveelheid: [sum > 0 ? formatTotal(sum) : '', ...loose].filter(Boolean).join(' + ')
    }))
    .sort((a, b) => a.naam.localeCompare(b.naam, 'nl'))
}
