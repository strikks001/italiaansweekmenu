/**
 * Stock check for every shop product used in content/recepten.
 *
 *   node scripts/voorraad-check.mjs
 *
 * Reads the public product feed of the shop (no login), so it runs anywhere.
 * Exits 1 when a product in a recipe is sold out, or when a variantId no longer
 * matches the product behind its URL; the "bestel alles" link would then give
 * an incomplete basket.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('../content/recepten/', import.meta.url).pathname

const files = readdirSync(ROOT, { recursive: true })
  .filter(f => f.endsWith('.md'))
  .map(f => join(ROOT, f))

/** url -> { variantIds: Set, recipes: Set } */
const products = new Map()

for (const file of files) {
  const text = readFileSync(file, 'utf8')
  const recipe = file.slice(ROOT.length)

  for (const url of text.match(/https:\/\/spesadaantonio\.nl\/products\/[^\s"']+/g) ?? []) {
    products.set(url, products.get(url) ?? { variantIds: new Set(), recipes: new Set() })
    products.get(url).recipes.add(recipe)
  }

  // A producten entry is `url:` followed by its `variantId:` two lines on.
  for (const m of text.matchAll(/^\s+url: (\S+)\n\s+variantId: "(\d+)"/gm)) {
    products.get(m[1])?.variantIds.add(m[2])
  }
}

let problems = 0

for (const [url, { variantIds, recipes }] of products) {
  const res = await fetch(`${url}.js`)
  if (!res.ok) {
    problems++
    console.log(`✗ ${url}\n    bestaat niet meer (${res.status}), in: ${[...recipes].join(', ')}`)
    continue
  }

  const product = await res.json()
  const variants = new Map(product.variants.map(v => [String(v.id), v]))

  for (const id of variantIds) {
    const variant = variants.get(id)
    if (!variant) {
      problems++
      console.log(`✗ ${product.title}\n    variantId ${id} hoort niet meer bij dit product, in: ${[...recipes].join(', ')}`)
    } else if (!variant.available) {
      problems++
      console.log(`✗ ${product.title}\n    UITVERKOCHT, in: ${[...recipes].join(', ')}`)
    }
  }

  // A productUrl without its own entry in `producten` still needs to be live.
  if (!variantIds.size && !product.available) {
    problems++
    console.log(`✗ ${product.title}\n    UITVERKOCHT (alleen als ingrediëntlink), in: ${[...recipes].join(', ')}`)
  }
}

console.log(problems
  ? `\n${problems} probleem(en) bij ${products.size} producten.`
  : `Alle ${products.size} producten zijn leverbaar.`)
process.exit(problems ? 1 : 0)
