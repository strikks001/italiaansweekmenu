---
name: nieuw-recept
description: Schrijf een nieuw Italiaans recept voor italiaansweekmenu, inclusief zoekwoordonderzoek, SEO-metadata en schema-conforme frontmatter. Gebruik dit wanneer er een recept toegevoegd moet worden, of wanneer een weekmenu een ontbrekend recept nodig heeft.
---

# Nieuw recept schrijven

Doel: één publicatieklaar receptbestand in `content/recepten/<slug>.md` dat
voldoet aan het schema, in de huisstijl geschreven is en op een reëel
zoekwoord mikt.

Lees **altijd eerst** beide referenties:

- `references/schrijfstijl.md` — toon, structuur, wat wel en niet
- `references/frontmatter.md` — het veldcontract en de YAML-valkuil

## Stap 1 — Kannibalisatie uitsluiten

Voordat je iets onderzoekt, controleer wat er al is:

```
grep -h "primair:" content/recepten/*.md
```

Mikt een bestaand recept al op hetzelfde hoofdzoekwoord, dan schrijf je geen
tweede pagina. Twee pagina's die om dezelfde term concurreren verzwakken elkaar
allebei. Kies een ander zoekwoord of stel voor het bestaande recept uit te
breiden.

## Stap 2 — Zoekwoordonderzoek

Doe dit vóór je een letter schrijft; de uitkomst bepaalt de titel en de kopjes.

1. Zoek met WebSearch op het Nederlandse gerecht plus "recept". Noteer wat er
   in de top 10 staat: welke sites, welke invalshoek, hoe lang.
2. Zoek de varianten die mensen echt intypen. Denk aan `<gerecht> recept`,
   `<gerecht> origineel`, `authentieke <gerecht>`, `<gerecht> zonder <x>`,
   `hoe maak je <gerecht>`. Dit zijn je secundaire termen.
3. Bepaal de **zoekintentie**. Bij recepten is dat vrijwel altijd
   `informationeel`: mensen willen koken, niet kopen. Schrijf daarnaar.
4. Zoek een **hoek die de top 10 niet heeft**. Meestal is dat de authentieke
   Italiaanse versie tegenover de vernederlandste. Dat is het bestaansrecht van
   de pagina; zonder eigen hoek publiceer je niet.

Is de Ahrefs-connector geautoriseerd, gebruik die dan voor echt zoekvolume en
vul `maandelijksVolume` en `moeilijkheid` in. Zo niet: **laat die velden leeg**.
Verzin nooit cijfers.

## Stap 3 — Zoekwoorden verwerken

- Het primaire zoekwoord staat in de `title` of in de eerste zin van de body.
- Het staat in de `description`.
- Twee of drie secundaire termen komen terug als `##`-kopje of in een
  FAQ-vraag — natuurlijk geformuleerd, nooit ingewrongen.
- Geen zoekwoorddichtheid nastreven. Google straft herhaling af; een
  vloeiende tekst met synoniemen scoort beter.

## Stap 4 — Slug en afbeelding

- Slug: kleine letters, koppeltekens, geen diakrieten, gebaseerd op de
  Italiaanse naam. `tiramisu-classico`, niet `tiramisu-recept-italiaans`.
- Zet `afbeelding` op `/images/<slug>.jpg` en meld aan het einde dat er nog een
  foto op die plek moet komen. Genereer geen placeholder.
- `afbeeldingAlt` beschrijft het bord, niet het zoekwoord.

## Stap 5 — Schrijven

Volg `references/schrijfstijl.md` op de letter. Vul de frontmatter volgens
`references/frontmatter.md`. Zet `gepubliceerd` op de dag van publicatie.

Voor de producten: kijk eerst welke er al gebruikt worden.

```
grep -h -A 2 "naam:" content/recepten/*.md | grep -B 1 spesadaantonio
```

Ken je de precieze product-URL niet, gebruik dan `https://www.spesadaantonio.nl`
en meld dat de diepe link nog ingevuld moet worden.

## Stap 6 — Verifiëren

```
pnpm generate
```

Controleer drie dingen en meld het resultaat:

1. `Failing Pages: 0` en `Total errors: 0`
2. `.output/public/recepten/<slug>/index.html` bestaat
3. Het Recipe-schema staat erin:
   `grep -c '"@type":"Recipe"' .output/public/recepten/<slug>/index.html`

Faalt de build, dan is het vrijwel altijd een onaangehaalde string met een
dubbele punt in de frontmatter. Zie `references/frontmatter.md`.

## Stap 7 — Opleveren

Rapporteer kort:

- gekozen primair zoekwoord en waarom
- welke hoek de pagina heeft die de concurrentie mist
- wat er nog handmatig moet: de foto, en eventueel de product-URL's

Commit niet zelf. De gebruiker beslist wat er live gaat.
