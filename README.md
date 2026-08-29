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

`nuxt.config.ts` heeft `content.preview.api` aanstaan, dus de repo is klaar
voor Studio. Koppel het project op [nuxt.studio](https://nuxt.studio) aan deze
GitHub-repo; Studio commit rechtstreeks naar `main` en Cloudflare bouwt opnieuw.
