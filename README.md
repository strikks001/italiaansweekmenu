# italiaansweekmenu

Elke week een nieuw Italiaans weekmenu met recepten, boodschappenlijst en
verwijzingen naar [spesadaantonio.nl](https://www.spesadaantonio.nl).

Live op [www.italiaansweekmenu.nl](https://www.italiaansweekmenu.nl).

## Stack

| Onderdeel | Keuze |
|---|---|
| Framework | Nuxt 4 |
| Content | @nuxt/content 3 — markdown, gevalideerd met Zod, opgeslagen in SQLite |
| UI | @nuxt/ui 4 op Tailwind 4 |
| SEO | @nuxtjs/seo — sitemap, robots, schema.org, og-image, link-checker |
| Afbeeldingen | @nuxt/image, statisch geoptimaliseerd naar WebP |
| Hosting | Cloudflare Pages, volledig statisch |
| Redactie | Nuxt Studio |

## Lokaal draaien

Dit project gebruikt **pnpm**, niet npm. (npm 11 loopt vast op de
peer-dependencies van het Nuxt-ecosysteem.)

```bash
corepack enable pnpm
pnpm install
pnpm dev
```

De site draait op http://localhost:3000.

## Bouwen

```bash
pnpm generate
```

Levert statische HTML in `.output/public` (met `dist` als symlink). Let in de
uitvoer op `Failing Pages: 0` en `Total errors: 0` — de link-checker vindt
kapotte interne links en pagina's die stukliepen op hun frontmatter.

## Content toevoegen

Content staat in `content/`, het schema in `content.config.ts`.

```
content/
  recepten/<slug>.md       -> /recepten/<slug>
  weekmenu/<jaar>-week-<nr>.md -> /weekmenu/<jaar>-week-<nr>
  over.md                  -> /over
```

Foto's horen in `public/images/<slug>.jpg`. De bestanden die er nu staan zijn
gegenereerde placeholders; vervang ze door echte foto's met dezelfde naam.

> **Let op bij het schrijven van frontmatter:** zet elke vrije tekst tussen
> dubbele aanhalingstekens. Een dubbele punt gevolgd door een spatie in een
> onaangehaalde zin breekt de frontmatter stil en zet alle velden erna op
> `null`. Zie `.claude/skills/nieuw-recept/references/frontmatter.md`.

### Zoekwoordonderzoek

```bash
node scripts/zoekwoorden.mjs "pasta alla norma"
```

Bevraagt Google Autocomplete voor Nederland en levert honderden varianten die
mensen echt intypen, gesplitst in Nederlandse en overige resultaten. Gratis en
zonder account.

Wil je er maandelijks zoekvolume bij, zet dan DataForSEO-credentials in `.env`
(zie `.env.example`). Dat werkt met vooruitbetaald tegoed — $50 minimum,
$0,0001 per zoekwoord — in plaats van een maandabonnement.

### Met Claude Code

```
/nieuw-recept       # zoekwoordonderzoek + recept in de vaste huisstijl
/nieuw-weekmenu     # stelt een week samen uit bestaande recepten
```

De schrijfstijl staat vast in
`.claude/skills/nieuw-recept/references/schrijfstijl.md`.

## Deployen naar Cloudflare Pages

Eenmalig instellen in het Cloudflare-dashboard:

| Instelling | Waarde |
|---|---|
| Framework preset | Nuxt.js (of "None") |
| Build command | `pnpm generate` |
| Build output directory | `dist` |
| Node-versie | `22` (via `.nvmrc`) |

Elke push naar `main` triggert een nieuwe build. Cloudflare herkent
`pnpm-lock.yaml` en gebruikt automatisch pnpm.

## Nuxt Studio

Studio is sinds versie 1 een **gratis, open-source Nuxt-module** die je zelf
host — niet meer het betaalde platform op nuxt.studio. Hij zit al geïnstalleerd.

### Lokaal gebruiken (huidige opzet)

```bash
pnpm dev
```

Linksonder verschijnt een bewerkknop. Daarmee krijg je een visuele editor op je
echte bestanden in `content/`: een WYSIWYG-editor voor de markdown-body,
automatisch gegenereerde formulieren voor de frontmatter op basis van het
Zod-schema, en een mediabibliotheek. Wijzigingen gaan direct naar je
bestandssysteem; committen en pushen doe je zelf.

Dat formulier voor de frontmatter is meteen je beste bescherming tegen de
YAML-valkuil hierboven: Studio quote strings correct voor je.

### Waarom niet op de live site

Studio in productie vereist server-routes voor OAuth-authenticatie, en dus
`nuxt build` in plaats van `nuxt generate`. Deze site is bewust volledig
statisch. Wil je later tóch op italiaansweekmenu.nl/_studio kunnen bewerken:

1. Maak een GitHub OAuth-app aan met callback op je productiedomein.
2. Zet `STUDIO_GITHUB_CLIENT_ID` en `STUDIO_GITHUB_CLIENT_SECRET` als secrets
   in Cloudflare.
3. Wissel Cloudflare Pages om naar Workers met SSR: build command `pnpm build`,
   en verhuis de contentdatabase naar D1.

`studio.repository` staat al goed in `nuxt.config.ts` — die is sowieso verplicht,
anders weigert de module te bouwen. Daardoor meldt elke build dat authenticatie
nog niet is ingesteld; dat is verwacht en onschadelijk zolang je statisch blijft.

Punt 3 is het echte werk; de rest is een middag. Zolang jij de enige redacteur
bent, is lokaal bewerken sneller.

### AI-assistent

Studio kan contentsuggesties doen via de Vercel AI Gateway. Die staat **uit** en
blijft uit zolang `AI_GATEWAY_API_KEY` niet gezet is. Bewust: het schrijven
gebeurt via Claude Code met de vaste schrijfstijlgids, en een tweede AI met een
eigen stem werkt die consistentie tegen.
