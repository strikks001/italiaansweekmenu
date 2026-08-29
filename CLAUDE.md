# italiaansweekmenu

Statische Nuxt 4-site: elk week een Italiaans weekmenu met recepten, die
verwijst naar de webshop spesadaantonio.nl.

## Werkafspraken

- **Gebruik `pnpm`, nooit `npm`.** npm 11 crasht op de peer-dependencies van dit
  project (`Cannot read properties of null (reading 'edgesOut')`).
- Verifieer wijzigingen met `pnpm generate`. Groen is `Failing Pages: 0` en
  `Total errors: 0`.
- Commit niet zonder dat erom gevraagd wordt.

## Content

Het schema in `content.config.ts` is leidend. Wijkt frontmatter ervan af, dan
zet Nuxt Content het veld stil op `null` en geeft de pagina een 500 tijdens de
build.

**Zet elke vrije tekst in frontmatter tussen dubbele aanhalingstekens.** Een
`: ` in een onaangehaalde zin leest YAML als een geneste sleutel; alles onder
die regel gaat verloren. Dit is de meest voorkomende bouwfout in dit project.

Recepten en weekmenu's schrijf je via de skills in `.claude/skills/`. De
schrijfstijl ligt vast in `.claude/skills/nieuw-recept/references/schrijfstijl.md`
en moet over alle recepten consistent blijven.

## Styling

Standaard Nuxt UI 4 met de standaardkleuren, -fonts en -groottes. `app.config.ts`
en `app/assets/css/main.css` zijn bewust leeg gehouden — de eigenaar bepaalt de
huisstijl zelf. Introduceer geen eigen paletten of fonts zonder overleg.

## Nuxt Studio

De `nuxt-studio`-module draait **alleen lokaal** (`pnpm dev`, knop linksonder).
Productie-Studio vereist SSR; deze site is bewust statisch. De build meldt elke
keer `In order to use Studio in production mode, you need to setup
authentication` — dat is verwacht en onschadelijk, niet iets om op te lossen.

## SEO

Elke pagina hoort `useSeoMeta` te zetten. Receptpagina's gebruiken
`defineRecipe` uit nuxt-schema-org; dat blok bepaalt of Google een rich result
toont. Tijden gaan als ISO 8601 (`isoDuur()` in `app/utils/duur.ts`).
