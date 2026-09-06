# Reviewchecklist

Loop deze lijst af **na** het schrijven, nooit tijdens. Bij een batch: eerst
alle recepten schrijven, dan alle recepten reviewen. Elk punt heeft een manier
om het te controleren; "ik denk dat het klopt" telt niet.

Vervang `<pad>` door `content/recepten/<gang>/<slug>.md`.

## 1. Uitleg van de stappen

- [ ] Elke stap heeft handeling, signaal én reden. Lees elke `tekst` en
      onderstreep het signaal (zien, ruiken, horen). Ontbreekt het: aanvullen.
- [ ] Elk moment waarop het mis kan gaan heeft een zin met de reparatie.
- [ ] De test: iemand die het gerecht nooit zag kan het koken zonder foto.
- [ ] Niet op elke stap een tip: `grep -c "tip:" <pad>` is kleiner dan het
      aantal stappen, en elke tip zegt iets wat niet al in de stap staat.
- [ ] De tijden in de stappen tellen op tot ongeveer `voorbereidingstijd` +
      `bereidingstijd`. Een recept dat 45 minuten belooft en 3 uur suddert,
      liegt in Google.

## 2. Ingrediënten

- [ ] Alles wat in een stap gebruikt wordt staat in de lijst, en alles in de
      lijst wordt in een stap gebruikt. Lees de stappen met de lijst ernaast.
- [ ] `naam` is alleen de productnaam. Hoeveelheid in `hoeveelheid`, eenheid in
      `eenheid`, bereiding in `opmerking`.
- [ ] Namen en eenheden volgen `references/ingredienten.md`. Controle:
      `node scripts/ingredienten-check.mjs <pad>`
- [ ] Zout en peper als losse items zonder hoeveelheid.
- [ ] Elk ingrediënt dat Spesa verkoopt heeft een `productUrl` én staat in
      `producten` met `variantId`, `prijs` en `afbeelding`.
- [ ] Elke `waarom` benoemt iets functioneels, geen lofprijzing.

## 3. Body

- [ ] Precies de vijf onderdelen uit de schrijfstijl, in die volgorde, met
      exact drie FAQ-vragen.
- [ ] 400 tot 600 woorden: `sed '1,/^---$/d' <pad> | wc -w`
- [ ] Geen opsommingstekens in de body.
- [ ] Elk feit over herkomst of traditie heeft een opgezochte bron. Geen bron,
      dan weg.
- [ ] De bereiding is afgeleid van GialloZafferano en Benedetta, maar geen
      zin, stapindeling of ingrediëntgroep is overgenomen. Leg een stap naast
      de bron: zelfde feiten, andere tekst en andere opbouw.
- [ ] Hoeveelheden in cijfers, andere getallen voluit.

## 4. Toon

Mechanisch te vangen, dus altijd draaien:

```
grep -n -i -E "heerlijk|verrukkelijk|smullen|handomdraai|jullie|\bu\b|!" <pad>
grep -n -i -E "antonio|mijn vriend|schoonmoeder|zijn moeder|mijn man" <pad>
```

Beide moeten leeg zijn. De tweede regel bewaakt dat het perspectief nooit de
inhoud wordt.

- [ ] Lees de openingsalinea hardop. Klinkt het als iemand die het aan een
      vriend uitlegt, of als een folder? Folder: herschrijven.

## 5. SEO en schema

- [ ] `title` is de Italiaanse naam, correct gespeld, zonder toevoegingen.
- [ ] `description` 140 tot 160 tekens:
      `grep "^description:" <pad> | sed 's/^description: *"//; s/"$//' | wc -m`
- [ ] Het primaire zoekwoord staat in de `description` en in de `title` of de
      eerste zin.
- [ ] `afbeeldingAlt` beschrijft het bord, niet het zoekwoord.
- [ ] Geen ander recept mikt op hetzelfde primaire zoekwoord:
      `grep -rh "primair:" content/recepten/ | sort | uniq -d` is leeg.

## 6. YAML en bestand

- [ ] Elke vrije tekst staat tussen dubbele aanhalingstekens. Snelle vangnet
      voor de meest voorkomende fout, een dubbele punt in een onaangehaalde
      zin: `grep -n -E "^\s*(description|tekst|tip|waarom|opmerking|antwoord|toelichting): [^\"]" <pad>`
      moet leeg zijn.
- [ ] Het bestand staat in de map van zijn `gang`:
      `grep "^gang:" <pad>` komt overeen met de mapnaam.
- [ ] `concept: true` zolang het recept nog niet live mag.

## 7. Build

```
pnpm generate
```

`Failing Pages: 0`, `Total errors: 0`, en het Recipe-schema staat in de
uitvoer: `grep -c '"@type":"Recipe"' .output/public/recepten/<slug>/index.html`
geeft 1.
