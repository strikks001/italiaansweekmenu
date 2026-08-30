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
 * Seasoning is written a dozen ways across recipes - "snuf zout", "grof
 * zeezout", "zout en zwarte peper" - and each spelling would otherwise become
 * its own line. These collapse to one entry, without an amount: adding up
 * pinches gives a number nobody shops by. One line can name several, hence
 * every match counts.
 */
const SEASONING = [
  { naam: 'zout', patroon: /zout/ },
  { naam: 'peper', patroon: /\bpeper\b/ },
  { naam: 'nootmuskaat', patroon: /nootmuskaat/ }
]

/** Lowercase without accents, so "Ragù" and "ragu" merge. */
const normalise = (text: string) =>
  text.toLowerCase().trim().normalize('NFD').replace(/[̀-ͯ]/g, '')

/**
 * One shopping list for a whole week.
 *
 * Merged per name *and* unit: 200 g and 2 stuks of the same thing cannot be
 * added up, so they stay separate lines rather than becoming a wrong number.
 * Amounts like "een snuf" have no number to sum and are listed as written.
 */
export function buildShoppingList(recipes: ReceptenCollectionItem[]): ShoppingItem[] {
  const items = new Map<string, ShoppingItem & { sum: number, loose: string[] }>()

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

  return [...items.values()]
    .map(({ sum, loose, ...item }) => ({
      ...item,
      hoeveelheid: [sum > 0 ? formatQuantity(sum) : '', ...loose].filter(Boolean).join(' + ')
    }))
    .sort((a, b) => a.naam.localeCompare(b.naam, 'nl'))
}
