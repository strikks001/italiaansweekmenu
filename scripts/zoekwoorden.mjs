#!/usr/bin/env node
/**
 * Zoekwoordonderzoek voor italiaansweekmenu.
 *
 *   node scripts/zoekwoorden.mjs "pasta alla norma"
 *   node scripts/zoekwoorden.mjs "pasta alla norma" --json
 *
 * Bevraagt Google Autocomplete voor Nederland. Dit zijn geen schattingen maar
 * daadwerkelijk door mensen ingetypte zoekopdrachten. Geen volumecijfers -
 * die haal je uit Google Search Console zodra de site geindexeerd is.
 */

const term = process.argv.slice(2).filter(a => !a.startsWith('--')).join(' ').trim()
const alsJson = process.argv.includes('--json')

if (!term) {
  console.error('Gebruik: node scripts/zoekwoorden.mjs "<zoekterm>" [--json]')
  process.exit(1)
}

// Modifiers die de meest waardevolle long-tail varianten blootleggen.
const VRAAGWOORDEN = ['hoe', 'wat', 'welke', 'waarom', 'hoeveel', 'waar', 'kan je', 'is']
const VOEGWOORDEN = ['met', 'zonder', 'voor', 'in de', 'op de']
const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('')

async function suggesties(query) {
  const url = 'https://suggestqueries.google.com/complete/search'
    + `?client=firefox&hl=nl&gl=nl&q=${encodeURIComponent(query)}`
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data?.[1]) ? data[1] : []
  } catch {
    return []
  }
}

/** Verwerkt de queue met beperkte gelijktijdigheid, zodat we Google niet overvragen. */
async function inBatches(items, grootte, fn) {
  const uit = []
  for (let i = 0; i < items.length; i += grootte) {
    uit.push(...await Promise.all(items.slice(i, i + grootte).map(fn)))
    await new Promise(r => setTimeout(r, 120))
  }
  return uit.flat()
}

const basis = await suggesties(term)

const uitbreidingen = [
  ...LETTERS.map(l => `${term} ${l}`),
  ...VRAAGWOORDEN.map(w => `${w} ${term}`),
  ...VOEGWOORDEN.map(w => `${term} ${w}`),
  `${term} recept`,
  `${term} origineel`,
  `authentieke ${term}`
]

const rest = await inBatches(uitbreidingen, 6, suggesties)

// Google mengt talen bij Italiaanse gerechtnamen. We gooien niets weg, maar
// zetten de Nederlandse varianten voorop: dat is waar we op willen ranken.
const NIET_NL = /\b(recipe|recipes|how|what|which|why|best|easy|healthy|vegan|with|without|the|is|are|can|you|make|ahead|freeze|authentic|ingredienti|ricetta|come|di|del|della|per|senza|migliore)\b/

const alles = [...new Set([...basis, ...rest].map(s => s.toLowerCase().trim()))]
  .filter(s => s.includes(term.split(' ')[0].toLowerCase()))
  .sort()

const nederlands = alles.filter(k => !NIET_NL.test(k))
const overig = alles.filter(k => NIET_NL.test(k))

if (alsJson) {
  console.log(JSON.stringify({ term, nederlands, overig }, null, 2))
} else {
  console.log(`\n"${term}" - ${nederlands.length} Nederlandse varianten, ${overig.length} overige\n`)
  console.log('--- NEDERLANDS ---')
  nederlands.forEach(k => console.log('  ' + k))
  console.log('\n--- OVERIG (Engels/Italiaans, ter orientatie) ---')
  overig.forEach(k => console.log('  ' + k))
  console.log()
}
