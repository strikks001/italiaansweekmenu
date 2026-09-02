# italiaansweekmenu

Statische Nuxt 4-site: elke week een Italiaans weekmenu met recepten, die
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

**Een recept hoort in `content/recepten/<gang>/`,** en die map moet in `GANGEN`
in `app/utils/gang.ts` staan. Staat hij daar niet, dan valt het recept buiten de
collectie: het verdwijnt van de site zonder dat de build klaagt. De URL blijft
plat (`/recepten/<slug>`, zonder de gang) doordat elke bron in
`content.config.ts` `prefix: '/recepten'` meekrijgt.

`app/utils/gang.ts` is de enige lijst van gangen: het schema, de mapnamen, de
filters op /recepten en de labels komen daar vandaan.

**Ingrediëntnamen zijn de naam van het product, verder niets.** De hoeveelheid
hoort in `hoeveelheid` en `eenheid` ("2" + "tenen" + "knoflook"), de bereiding
in `opmerking`. Eén ingrediënt per regel. De boodschappenlijst voegt samen op
naam plus eenheid, dus "boter" naast "koude roomboter" wordt twee regels.

Recepten en weekmenu's schrijf je via de skills in `.claude/skills/`. De
schrijfstijl ligt vast in `.claude/skills/nieuw-recept/references/schrijfstijl.md`
en moet over alle recepten consistent blijven.

## Styling

Standaard Nuxt UI 4 met de standaardkleuren, -fonts en -groottes. `app.config.ts`
is bewust leeg en `app/assets/css/main.css` bevat alleen de twee imports plus één
cursor-regel — de eigenaar bepaalt de huisstijl zelf. Introduceer geen eigen
paletten of fonts zonder overleg.

Die cursor-regel is geen stijlkeuze: Tailwind 4 haalde `cursor: pointer` van
buttons af, waardoor elke knop een pijltje kreeg terwijl links een handje
houden. Niet weghalen.

## Nuxt Studio

De `nuxt-studio`-module draait **alleen lokaal** (`pnpm dev`, knop linksonder).
Productie-Studio vereist SSR; deze site is bewust statisch. De build meldt elke
keer `In order to use Studio in production mode, you need to setup
authentication` — dat is verwacht en onschadelijk, niet iets om op te lossen.

## SEO

Elke pagina hoort `useSeoMeta` te zetten. Receptpagina's gebruiken
`defineRecipe` uit nuxt-schema-org; dat blok bepaalt of Google een rich result
toont. Tijden gaan als ISO 8601 (`isoDuur()` in `app/utils/duur.ts`).

Zoekwoordonderzoek gaat via `node scripts/zoekwoorden.mjs "<gerecht>"`
(Google Autocomplete, gratis). Er zijn geen volumecijfers: die komen uit Google
Search Console zodra de site geïndexeerd is. Verzin ze nooit.

## Deploy

Cloudflare **Workers** (Pages is daarin opgegaan), service `italiaansweekmenu`,
gekoppeld aan `main` op github.com/strikks001/italiaansweekmenu.

De deploy leest `wrangler.jsonc`, niet een formulier in het dashboard. Er staat
bewust geen `main` in: zonder worker-script serveert Cloudflare alleen de
bestanden uit `.output/public`. Gebruik dat pad, nooit `dist` — die symlink
wijst naar een absoluut pad op één machine en bestaat niet op de builder.

In het dashboard staat alleen: build command `pnpm generate`, deploy command
`pnpm exec wrangler deploy`. Node 22 via `.nvmrc`, pnpm via `packageManager` in
package.json (zonder die pin pakt de builder npm, en npm crasht op dit project).

Nuxt Studio wordt alleen in `NODE_ENV=development` als module geladen. Dat
scheelt 28 MB aan editor-assets per deploy en is de reden dat de build niet meer
klaagt over Studio-authenticatie.

Bouwwaarschuwingen die verwacht zijn en geen actie vragen:
- og-image kan "Segoe UI", "Helvetica Neue" en "Arial" niet ophalen. Dat zijn
  systeemfonts, geen webfonts; Satori valt terug op Inter.
- eslint meldt dat `/over` niet in de sitemap staat. Dat klopt niet — de regel
  kan de catch-all route niet resolven.
