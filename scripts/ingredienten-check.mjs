#!/usr/bin/env node
/**
 * Checks recipe ingredients against the lexicon in
 * .claude/skills/nieuw-recept/references/ingredienten.md.
 *
 *   node scripts/ingredienten-check.mjs                 # all recipes
 *   node scripts/ingredienten-check.mjs content/recepten/primo/x.md
 */
import { globSync, readFileSync } from 'node:fs'
import { parse } from 'yaml'

const LEXICON = '.claude/skills/nieuw-recept/references/ingredienten.md'
const SEASONING = /zout|\bpeper\b|nootmuskaat/

// Same folding as app/utils/shopping.ts, so both agree on what merges.
const fold = s => s.toLowerCase().trim().normalize('NFD').replace(/[̀-ͯ]/g, '')
const stem = s => fold(s).replace(/(?:s|en)$/, '')

const UNIT_IN_NAME = /^(bosjes?|stengels?|teen|tenen|teentjes?|takjes?|blaadjes?|plak|plakken|snee|sneden|korsten?|zakjes?|blik|blikken|snufjes?|snuf|el|tl|g|kg|ml|l)\s/i
const PREP_IN_NAME = /\b(gesneden|gesnipperd|geraspt|gehakt|fijngesneden|fijngehakt|uitgelekt|geweekt|in reepjes|in blokjes|met bot|zonder vel|zonder bot|rijpe?|dunne|verse?)\b/i

function loadLexicon() {
  const entries = new Map()
  const aliases = new Map()
  for (const line of readFileSync(LEXICON, 'utf8').split('\n')) {
    if (!line.startsWith('|') || /^\|\s*naam|^\|-|^\|\s*---/.test(line)) continue
    const [naam, eenheden, ook] = line.split('|').slice(1, 4).map(c => c.trim())
    if (!naam) continue
    const units = eenheden.split(',').map(u => u.trim()).map(u => (u === '-' ? '' : u))
    entries.set(stem(naam), { naam, units })
    for (const a of ook.split(',').map(s => s.trim()).filter(Boolean)) aliases.set(stem(a), naam)
  }
  return { entries, aliases }
}

function frontmatter(path) {
  const text = readFileSync(path, 'utf8')
  const end = text.indexOf('\n---', 4)
  return parse(text.slice(4, end))
}

function check(path, { entries, aliases }) {
  const findings = []
  const seen = new Set()
  const fm = frontmatter(path)
  for (const group of fm.ingredienten ?? []) {
    for (const item of group.items ?? []) {
      const naam = String(item.naam ?? '')
      const eenheid = item.eenheid ? String(item.eenheid) : ''
      const where = `"${naam}"`

      if (typeof item.hoeveelheid === 'number') findings.push(`${where}: hoeveelheid ${item.hoeveelheid} moet een string zijn ("${item.hoeveelheid}")`)
      if (UNIT_IN_NAME.test(naam)) findings.push(`${where}: eenheid hoort in \`eenheid\`, niet in de naam`)
      if (/\bof\b/.test(naam)) findings.push(`${where}: kies één ingrediënt, het alternatief hoort in \`opmerking\``)
      if (PREP_IN_NAME.test(naam) && !entries.has(stem(naam))) findings.push(`${where}: bereiding of eigenschap hoort in \`opmerking\``)

      // A weighed amount (bread dough) is fine; "snuf" or "1 el" is not.
      if (SEASONING.test(fold(naam)) && (item.hoeveelheid || eenheid) && !['g', 'tl'].includes(eenheid)) {
        findings.push(`${where}: zout, peper en nootmuskaat zonder hoeveelheid en eenheid`)
      }

      const key = `${stem(naam)}|${fold(eenheid)}`
      if (seen.has(key)) findings.push(`${where}: staat twee keer in dit recept met dezelfde eenheid`)
      seen.add(key)

      const entry = entries.get(stem(naam))
      if (!entry) {
        const alias = aliases.get(stem(naam))
        findings.push(alias
          ? `${where}: schrijf als "${alias}"`
          : `${where}: onbekend, corrigeer de naam of voeg hem toe aan het lexicon`)
        continue
      }
      if (!entry.units.includes(eenheid)) {
        const list = entry.units.map(u => u || 'stuks').join(', ')
        findings.push(`${where}: eenheid "${eenheid || 'stuks'}" hoort niet bij ${entry.naam} (wel: ${list})`)
      }
    }
  }
  return findings
}

const paths = process.argv.slice(2)
const files = paths.length ? paths : globSync('content/recepten/*/*.md').sort()
const lexicon = loadLexicon()
let total = 0

for (const file of files) {
  const findings = check(file, lexicon)
  if (!findings.length) continue
  total += findings.length
  console.log(`\n${file}`)
  for (const f of findings) console.log(`  - ${f}`)
}

console.log(total ? `\n${total} bevinding(en) in ${files.length} recept(en).` : `Alle ${files.length} recept(en) volgen het lexicon.`)
process.exit(total ? 1 : 0)
