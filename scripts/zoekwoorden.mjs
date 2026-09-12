#!/usr/bin/env node
/**
 * Keyword research for italiaansweekmenu.
 *
 *   node scripts/zoekwoorden.mjs "pasta alla norma"
 *   node scripts/zoekwoorden.mjs "pasta alla norma" --json
 *
 * Asks Google Autocomplete for the Netherlands. These are queries people
 * actually typed, not estimates. No volumes - those come from Google Search
 * Console once the site is indexed.
 */

const term = process.argv.slice(2).filter(a => !a.startsWith('--')).join(' ').trim()
const asJson = process.argv.includes('--json')

if (!term) {
  console.error('Gebruik: node scripts/zoekwoorden.mjs "<zoekterm>" [--json]')
  process.exit(1)
}

// Modifiers that expose the most valuable long-tail variants.
const QUESTION_WORDS = ['hoe', 'wat', 'welke', 'waarom', 'hoeveel', 'waar', 'kan je', 'is']
const CONNECTORS = ['met', 'zonder', 'voor', 'in de', 'op de']
const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('')

async function suggest(query) {
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

/** Works the queue with limited concurrency, so Google is not hammered. */
async function inBatches(items, size, fn) {
  const out = []
  for (let i = 0; i < items.length; i += size) {
    out.push(...await Promise.all(items.slice(i, i + size).map(fn)))
    await new Promise(r => setTimeout(r, 120))
  }
  return out.flat()
}

const base = await suggest(term)

const expansions = [
  ...LETTERS.map(l => `${term} ${l}`),
  ...QUESTION_WORDS.map(w => `${w} ${term}`),
  ...CONNECTORS.map(w => `${term} ${w}`),
  `${term} recept`,
  `${term} origineel`,
  `authentieke ${term}`
]

const rest = await inBatches(expansions, 6, suggest)

// Google mixes languages for Italian dish names. Nothing is thrown away, but
// the Dutch variants come first: that is what the site ranks for.
const NOT_DUTCH = /\b(recipe|recipes|how|what|which|why|best|easy|healthy|vegan|with|without|the|is|are|can|you|make|ahead|freeze|authentic|ingredienti|ricetta|come|di|del|della|per|senza|migliore)\b/

const all = [...new Set([...base, ...rest].map(s => s.toLowerCase().trim()))]
  .filter(s => s.includes(term.split(' ')[0].toLowerCase()))
  .sort()

const dutch = all.filter(k => !NOT_DUTCH.test(k))
const other = all.filter(k => NOT_DUTCH.test(k))

if (asJson) {
  console.log(JSON.stringify({ term, dutch, other }, null, 2))
} else {
  console.log(`\n"${term}" - ${dutch.length} Nederlandse varianten, ${other.length} overige\n`)
  console.log('--- NEDERLANDS ---')
  dutch.forEach(k => console.log('  ' + k))
  console.log('\n--- OVERIG (Engels/Italiaans, ter orientatie) ---')
  other.forEach(k => console.log('  ' + k))
  console.log()
}
