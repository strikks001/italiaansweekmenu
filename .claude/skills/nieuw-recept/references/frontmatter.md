# Frontmatter-contract voor recepten

Het schema staat in `content.config.ts`. Wijkt de frontmatter daarvan af, dan
zet Nuxt Content het veld op `null` en geeft de pagina een 500 bij het bouwen.

## Kritieke YAML-regel

**Zet elke vrije tekst tussen dubbele aanhalingstekens.** Een `: ` (dubbele punt
plus spatie) of een `#` midden in een onaangehaalde zin breekt de hele
frontmatter stil: YAML leest het als een geneste sleutel, de waarde wordt een
object en alle velden erna verdwijnen.

```yaml
# fout - alles onder deze regel gaat verloren
description: Kip op jagerswijze uit Toscane: gestoofd met rozemarijn.

# goed
description: "Kip op jagerswijze uit Toscane: gestoofd met rozemarijn."
```

Dit geldt voor: `title`, `description`, `thema`, `afbeeldingAlt`, `naam`,
`opmerking`, `titel`, `tekst`, `tip`, `waarom`, `toelichting`, `primair`.

Getallen (`voorbereidingstijd`, `personen`, `calorieen`) en datums
(`gepubliceerd: 2026-08-24`) blijven onaangehaald.

## Verplichte velden

| Veld | Type | Toelichting |
|---|---|---|
| `title` | string | Italiaanse gerechtnaam |
| `description` | string | 140-160 tekens, meta-description |
| `gepubliceerd` | datum | `JJJJ-MM-DD`, onaangehaald |
| `afbeelding` | pad | `/images/<slug>.jpg` |
| `afbeeldingAlt` | string | Beschrijf wat er te zien is, geen zoekwoorden stapelen |
| `gang` | enum | `antipasto` `primo` `secondo` `contorno` `dolce` `basis` |
| `voorbereidingstijd` | getal | minuten |
| `bereidingstijd` | getal | minuten, `0` bij ongekookte gerechten |
| `personen` | getal | standaard 4 |
| `moeilijkheid` | enum | `makkelijk` `gemiddeld` `uitdagend` |
| `ingredienten` | lijst | groepen met `items` |
| `stappen` | lijst | 5-7 stappen |
| `zoekwoorden` | object | `primair` verplicht |

Optioneel: `regio`, `seizoen`, `dieet`, `voedingswaarde`, `producten`,
`gewijzigd`, `concept`.

## Structuur van ingrediënten

```yaml
ingredienten:
  - groep: "Voor de saus"      # weglaten bij één lijst
    items:
      - hoeveelheid: "800"     # altijd string, ook bij getallen
        eenheid: g
        naam: "San Marzano tomaten uit blik"
        opmerking: "uitgelekt"           # optioneel
        productUrl: https://...          # optioneel, maakt het een link
```

`hoeveelheid` is een string omdat "een snuf", "1,5" en "2-3" allemaal moeten
kunnen. Laat `hoeveelheid` en `eenheid` weg bij zout en peper.

## Controle achteraf

Na het schrijven altijd draaien:

```
pnpm generate
```

Let op `Failing Pages: 0` en `Total errors: 0`. Een recept dat niet in
`.output/public/recepten/<slug>/index.html` staat, is stilgevallen op een
YAML-fout.
