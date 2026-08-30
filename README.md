# italiaansweekmenu

Een receptenblog die elke week een compleet Italiaans weekmenu publiceert:
vijf gerechten die op elkaar aansluiten, met één gedeelde boodschappenlijst.

🔗 [www.italiaansweekmenu.nl](https://www.italiaansweekmenu.nl)

## Wat dit project is

De meeste receptensites geven je losse gerechten. Dit project stelt een hele
week samen — licht op maandag, de stoofpot op donderdag, en gerechten die
elkaars ingrediënten hergebruiken zodat er niets overblijft.

De recepten houden zich aan wat er in Italië daadwerkelijk gekookt wordt, ook
waar dat afwijkt van de vernederlandste versie. Waar we van de gebaande paden
gaan, staat erbij waarom.

## Stack

| | |
|---|---|
| Framework | [Nuxt 4](https://nuxt.com) |
| Content | [@nuxt/content 3](https://content.nuxt.com) — markdown, gevalideerd met Zod |
| UI | [@nuxt/ui 4](https://ui.nuxt.com) op Tailwind 4 |
| SEO | [@nuxtjs/seo](https://nuxtseo.com) — sitemap, schema.org, og-image |
| Redactie | [Nuxt Studio](https://nuxt.studio) (lokaal) |
| Hosting | Cloudflare Workers, volledig statisch |

Elk recept levert een compleet [schema.org Recipe](https://schema.org/Recipe)-blok
met kooktijden, ingrediënten en bereidingsstappen, zodat Google er een rich
result van kan maken.

## Aan de slag

Dit project gebruikt **pnpm**.

```bash
corepack enable pnpm
pnpm install
pnpm dev
```

De site draait op http://localhost:3000. Linksonder verschijnt de bewerkknop van
Nuxt Studio, waarmee je de content visueel bewerkt.

```bash
pnpm generate    # statische build naar .output/public
pnpm lint
pnpm typecheck
```

## Structuur

```
content/recepten/<slug>.md            een recept
content/weekmenu/<jaar>-week-<nr>.md  een week, verwijst naar recepten
content.config.ts                     het Zod-schema dat beide valideert
app/pages/                            de routes
app/components/                       de bouwstenen
scripts/zoekwoorden.mjs               zoekwoordonderzoek via Google Autocomplete
.claude/skills/                       schrijfrichtlijnen voor nieuwe recepten
```

`content.config.ts` is de kern: het bepaalt welke velden een recept heeft,
genereert de TypeScript-types én de invulformulieren in Studio.

## Licentie

De code is vrij te gebruiken. De recepten en teksten niet.
