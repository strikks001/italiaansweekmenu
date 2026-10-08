---
name: nieuw-recept
description: Schrijf een nieuw Italiaans recept voor italiaansweekmenu, inclusief zoekwoordonderzoek, SEO-metadata en schema-conforme frontmatter. Gebruik dit wanneer er een recept toegevoegd moet worden.
---

# Nieuw recept schrijven

Doel: één publicatieklaar receptbestand in `content/recepten/<gang>/<slug>.md` dat
voldoet aan het schema, in de huisstijl geschreven is en op een reëel
zoekwoord mikt.

Lees **altijd eerst** deze referenties:

- `references/schrijfstijl.md` — toon, structuur, uitlegstandaard
- `references/frontmatter.md` — het veldcontract en de YAML-valkuil
- `references/checklist.md` — wat je na het schrijven controleert
- `references/ingredienten.md` — de vaste ingrediëntnamen en eenheden

Schrijf je meer dan één recept, lees dan eerst "In batches werken" onderaan:
de stappen blijven gelijk, maar de volgorde over de recepten heen verandert.

## Stap 0 — Recept vanaf een eigen foto

Levert de gebruiker een foto van een gerecht dat ze zelf maakte, dan is die
foto de bron voor de bereiding, niet GialloZafferano of Benedetta. Die twee
gebruik je dan alleen om verhoudingen en tijden te toetsen. Vraag vóór je
schrijft, in één bericht, om:

- de naam van het gerecht en voor hoeveel personen het was
- de ingrediënten met de hoeveelheden die zij gebruikte, ook als het
  schattingen zijn
- hoe zij het maakte, in eigen woorden en in volgorde, met wat er tijd kostte
- wat het verschil maakte of wat ze de volgende keer anders zou doen
- of ze de stappen ook op foto heeft

Wat de gebruiker vertelt is de waarheid van het recept; jij voegt de
uitlegstandaard toe (signaal en reden bij elke handeling) en vult alleen aan
wat zij niet noemt, met de bronnen erbij. Persoonlijke opmerkingen van haar
mogen in de body, in haar woorden.

De foto wordt de hoofdafbeelding: `public/images/<slug>.jpg`, geoptimaliseerd
op maximaal 1600 px breed. Stapfoto's, als ze er zijn, liggend als
`public/images/<slug>-stap-<n>.jpg` en in de frontmatter bij de stap onder
`afbeelding` met `src` en `alt`. Daarna volg je de gewone stappen vanaf 1.

## Stap 1 — Kannibalisatie uitsluiten

Voordat je iets onderzoekt, controleer wat er al is:

```
grep -rh "primair:" content/recepten/
```

Mikt een bestaand recept al op hetzelfde hoofdzoekwoord, dan schrijf je geen
tweede pagina. Twee pagina's die om dezelfde term concurreren verzwakken elkaar
allebei. Kies een ander zoekwoord of stel voor het bestaande recept uit te
breiden.

## Stap 2 — Zoekwoordonderzoek

Doe dit vóór je een letter schrijft; de uitkomst bepaalt de titel en de kopjes.

### 2a. Haal de echte zoekopdrachten op

```
node scripts/zoekwoorden.mjs "<gerecht>"
```

Dit bevraagt Google Autocomplete voor Nederland en levert enkele honderden
varianten die mensen daadwerkelijk intypen — geen schattingen, maar echte
formuleringen. De uitvoer is gesplitst in Nederlands en overig; werk met het
Nederlandse deel.

Er zitten bewust geen volumecijfers bij. **Laat `maandelijksVolume` en
`moeilijkheid` dus leeg** — verzin nooit cijfers.

Zodra de site geïndexeerd is, is Google Search Console de betrouwbare bron:
daar staan de echte vertoningen, klikken en posities van deze site. Vraag de
gebruiker om een export als je wilt weten waar al ranking op zit, en gebruik
dat om te kiezen tussen uitbreiden van een bestaande pagina of een nieuwe.

### 2b. Lees de lijst als een SEO'er

Zoek in de uitvoer naar drie dingen:

1. **Het hoofdzoekwoord.** Meestal `<gerecht> recept` of `<gerecht>` zelf.
   Kies de kortste variant die nog steeds koopintentie-vrij en specifiek is.
2. **Secundaire termen.** Varianten met `origineel`, `authentiek`, `zonder <x>`,
   `met <x>`. Neem er vier die je natuurlijk in de tekst kwijt kunt.
3. **FAQ-vragen.** Alles wat begint met `hoe`, `kan je`, `hoeveel`, `waarom`.
   Dit zijn letterlijk de drie vragen voor je FAQ-sectie. Neem de vraag over in
   de bewoording van de gebruiker, niet in je eigen woorden.

### 2c. Controleer de concurrentie

Zoek met WebSearch op het gekozen hoofdzoekwoord. Noteer wie er in de top 10
staat en welke invalshoek ze hebben. Zoek een **hoek die zij niet hebben** —
meestal is dat de authentieke Italiaanse versie tegenover de vernederlandste.
Dat is het bestaansrecht van de pagina; zonder eigen hoek publiceer je niet.

### 2d. Zoekintentie

Bij recepten is dat vrijwel altijd `informationeel`: mensen willen koken, niet
kopen. Schrijf daarnaar, en houd de productverwijzingen daarom terughoudend.

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

### 5a. De bereiding afleiden, niet kopiëren

Verzin geen bereiding. Haal verhoudingen, volgorde en tijden uit twee
bronnen en leg ze naast elkaar:

- GialloZafferano (giallozafferano.it), de Italiaanse standaard
- Fatto in casa da Benedetta (fattoincasadabenedetta.it), de huiselijke versie

Verschillen ze, kies dan bewust en leg in het recept uit waarom (dat is vaak
meteen "Het ingrediënt of de techniek die het verschil maakt"). Reken om naar
4 personen en naar de eenheden uit het lexicon.

Wat je overneemt: de feiten. Verhoudingen, temperaturen, tijden, volgorde.
Wat je **nooit** overneemt: zinnen, de indeling van de stappen, de
ingrediëntgroepen, de tips, de titels van de stappen. Het recept wordt in je
eigen woorden geschreven, met de uitlegstandaard uit `schrijfstijl.md`
(handeling, signaal, reden), die geen van beide bronnen zo heeft. Controle:
geen enkele zin uit het recept mag terug te vinden zijn in de bron, ook niet
vertaald.

Noem beide bronnen in de oplevering, niet in het recept.

### 5b. Het recept

Volg `references/schrijfstijl.md` op de letter. Vul de frontmatter volgens
`references/frontmatter.md` en gebruik voor elk ingrediënt de naam en eenheid
uit `references/ingredienten.md`. Staat een ingrediënt daar niet in, voeg het
dan eerst toe aan het lexicon. Zet `gepubliceerd` op de dag van publicatie.

Voor de producten: loop **elk** ingrediënt na op de webshop. Kijk eerst wat al
eerder gebruikt is (dat levert meteen `variantId`, prijs en afbeelding op):

```
grep -rh -A 5 "^  - naam:" content/recepten/ | grep -B 1 -A 4 spesadaantonio
```

Zoek daarna de rest op via de Shopify-connector (`search_products`) of op
spesadaantonio.nl. Elk gevonden product krijgt een `productUrl` op het
ingrediënt én een item in `producten`; zie `references/schrijfstijl.md`.

**Zet alleen producten in het recept die nu leverbaar zijn.** De knop "Bestel
de ingrediënten" legt alles in één keer in de winkelmand; één uitverkocht
product geeft een onvolledig mandje of een foutmelding. Draai daarom, voordat
je links zet en nogmaals bij het opleveren:

```
node scripts/voorraad-check.mjs
```

Dat leest de openbare productfeed van de webshop en meldt uitverkochte
producten, verdwenen producten en `variantId`s die niet meer kloppen. Is een
product op, zoek dan een leverbaar alternatief; is er geen, haal het product
uit `producten` én de `productUrl` van het ingrediënt weg. Zet nooit een
uitverkocht product erin "voor als het weer binnenkomt".
Ken je de precieze product-URL niet, gebruik dan `https://spesadaantonio.nl`
en meld dat de diepe link nog ingevuld moet worden.

## Stap 6 — Reviewen

Loop `references/checklist.md` volledig af, punt voor punt, en fix wat niet
klopt. Draai de grep-controles daadwerkelijk; meld welke punten je aanpaste.
Bij een batch: eerst alle recepten schrijven, dan alle recepten reviewen.

## Stap 7 — Verifiëren

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

## Stap 8 — Opleveren

Rapporteer kort:

- gekozen primair zoekwoord en waarom
- welke hoek de pagina heeft die de concurrentie mist
- wat er nog handmatig moet: de foto, en eventueel de product-URL's

Commit niet zelf. De gebruiker beslist wat er live gaat.

## In batches werken

Eén recept tegelijk van stap 1 tot 8 is goed voor één recept. Voor een
database van tientallen recepten werk je per **fase** over de hele batch, niet
per recept over alle fasen. Schakelen tussen onderzoeken, schrijven en
controleren kost meer dan de stappen zelf.

De planning staat in `planning/recepten.md`. Elke fase werkt die tabel bij.

### Fase A — Plannen (één keer)

Vul de tabel met alle gerechten die je wilt, verdeeld over gangen en
seizoenen, richting de streefaantallen bovenaan het bestand. Nog geen
zoekwoorden, nog geen tekst. Controleer wel meteen kannibalisatie voor de hele
lijst: twee gerechten die op hetzelfde zoekwoord gaan mikken (bijvoorbeeld
twee ragù's) horen niet allebei op de lijst.

### Fase B — Zoekwoorden in bulk

Draai stap 2a voor een hele reeks achter elkaar en bewaar de uitvoer, zodat je
tijdens het schrijven niets opnieuw hoeft op te halen:

```
node scripts/zoekwoorden.mjs "<gerecht>" --json > planning/zoekwoorden/<slug>.json
```

Lees daarna per gerecht de uitvoer zoals in stap 2b en zet het primaire
zoekwoord in de tabel. Status: `zoekwoorden`. Controleer de kolom op dubbelen:
elke regel een ander primair zoekwoord.

### Fase C — Schrijven, vijf per gang

Schrijf vijf recepten van **dezelfde gang** in één sessie: de toon en de
opbouw blijven dan gelijk, en de gedeelde ingrediënten vallen op. Per recept
stap 3 tot en met 5, met deze afwijkingen:

- `concept: true` op elk recept. Niets gaat live voordat het gereviewd is.
- `gepubliceerd` krijgt de datum van vandaag; bij livegang zet je hem op de
  echte publicatiedatum.
- Nog niet bouwen en nog niet reviewen. Wel na elk recept
  `node scripts/ingredienten-check.mjs <pad>` draaien, want een verkeerde
  ingrediëntnaam fix je het snelst zolang het recept vers is.

Status: `geschreven`.

### Fase D — Reviewen en bouwen, per batch

Pas als de hele batch geschreven is: stap 6 voor elk recept, dan één keer
`pnpm ingredienten` en één keer `pnpm generate` voor alles tegelijk. Meld per
recept wat je aanpaste. Status: `gereviewd`.

### Fase E — Live zetten

Per recept, wanneer de foto er is: `concept` weg en `gepubliceerd` op de
publicatiedatum. Draai vlak ervoor `node scripts/voorraad-check.mjs` nog
eens. Status: `live`.
