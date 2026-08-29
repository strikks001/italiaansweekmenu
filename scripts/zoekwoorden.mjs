#!/usr/bin/env node
/**
 * Zoekwoordonderzoek voor italiaansweekmenu.
 *
 *   node scripts/zoekwoorden.mjs "pasta alla norma"
 *   node scripts/zoekwoorden.mjs "pasta alla norma" --json
 *
 * Bron 1 (gratis, altijd): Google Autocomplete. Dit zijn geen geschatte maar
 * daadwerkelijk door mensen ingetypte zoekopdrachten, gefilterd op Nederland
 * en Nederlands. Zonder volume, maar met perfecte formulering.
 *
 * Bron 2 (optioneel, betaald): DataForSEO voor echt maandelijks zoekvolume.
 * Wordt alleen gebruikt als DATAFORSEO_LOGIN en DATAFORSEO_PASSWORD in de
 * omgeving staan. Zie .env.example.
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
  const url = `https://suggestqueries.google.com/complete/search`
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

/** Verwerkt de queue met een beperkte gelijktijdigheid, zodat we Google niet overvragen. */
async function inBatches(items, grootte, fn) {
  const uit = []
  for (let i = 0; i < items.length; i += grootte) {
    uit.push(...await Promise.all(items.slice(i, i + grootte).map(fn)))
    await new Promise(r => setTimeout(r, 120))
  }
  return uit.flat()
}

async function volumes(keywords) {
  const login = process.env.DATAFORSEO_LOGIN
  const wachtwoord = process.env.DATAFORSEO_PASSWORD
  if (!login || !wachtwoord) return null

  const auth = Buffer.from(`${login}:${wachtwoord}`).toString('base64')
  const res = await fetch('https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live', {
    method: 'POST',
    headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
    // 2528 = Nederland (Google geo target id). Controleer desgewenst via
    // https://api.dataforseo.com/v3/keywords_data/google_ads/locations
    body: JSON.stringify([{ keywords: keywords.slice(0, 1000), location_code: 2528, language_code: 'nl' }])
  })
  if (!res.ok) {
    console.error(`  DataForSEO gaf ${res.status}; verder zonder volumedata.`)
    return null
  }
  const data = await res.json()
  const rijen = data?.tasks?.[0]?.result ?? []
  return new Map(rijen.map(r => [r.keyword, {
    volume: r.search_volume,
    concurrentie: r.competition,
    cpc: r.cpc
  }]))
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

const volumeMap = await volumes(alles)

const verrijk = k => ({ zoekwoord: k, ...(volumeMap?.get(k) ?? {}) })

if (alsJson) {
  console.log(JSON.stringify({
    term,
    bron: volumeMap ? 'autocomplete + dataforseo' : 'autocomplete',
    nederlands: nederlands.map(verrijk),
    overig: overig.map(verrijk)
  }, null, 2))
} else {
  const regel = (k) => {
    const v = volumeMap?.get(k)
    return v?.volume != null ? `${String(v.volume).padStart(7)}  ${k}` : `         ${k}`
  }
  console.log(`\n"${term}" - ${nederlands.length} Nederlandse varianten, ${overig.length} overige`)
  console.log(volumeMap
    ? '(volume uit DataForSEO, Nederland/Nederlands)'
    : '(alleen autocomplete - geen volumedata, laat maandelijksVolume leeg)')

  console.log('\n--- NEDERLANDS ---')
  nederlands.forEach(k => console.log(regel(k)))
  console.log('\n--- OVERIG (Engels/Italiaans, ter oriëntatie) ---')
  overig.forEach(k => console.log(regel(k)))
  console.log()
}
