---
name: nieuw-weekmenu
description: Stel een nieuw wekelijks Italiaans menu samen voor italiaansweekmenu, met een thema, vijf gerechten, een gedeelde boodschappenlijst en SEO-metadata. Gebruik dit aan het begin van een nieuwe week of wanneer er een weekmenu vooruit gepland moet worden.
---

# Nieuw weekmenu samenstellen

Doel: één bestand in `content/weekmenu/<jaar>-week-<nr>.md` dat vijf avonden
dekt en de bestaande receptenbibliotheek zo goed mogelijk benut.

## Stap 1 — Inventariseren

```
grep -h -E "^title:|^gang:|^regio:|^gepubliceerd:" content/recepten/*.md
grep -l "" content/weekmenu/*.md
```

Kijk welke recepten er zijn en welke thema's de afgelopen weken al langskwamen.
Herhaal geen regio of thema binnen zes weken.

## Stap 2 — Thema kiezen

Een thema is een echte samenhang, geen etiket. Werkende invalshoeken:

- **Regionaal** — een week uit één streek ("Sicilië in de zomer")
- **Seizoensgebonden** — wat er nu op de markt ligt
- **Techniek** — een week rond langzaam stoven, of juist alles binnen dertig minuten
- **Reis** — van zuid naar noord, zoals week 36

Controleer dat het thema past bij het seizoen op de publicatiedatum.

## Stap 3 — De week opbouwen

Vijf gerechten, maandag tot en met vrijdag. Houd je aan deze regels:

- **Maandag en dinsdag licht en snel.** Maximaal 45 minuten totaal.
- **Woensdag mag de oven aan.** Weinig handelingen, lange wachttijd.
- **Donderdag is de bewerkelijke dag.** Hier hoort de stoofpot of de ragù.
- **Vrijdag is het dessert** of een gerecht dat je donderdag al voorbereidde.
- Nooit twee keer pasta als hoofdcomponent in één week.
- Minstens één vegetarisch gerecht.
- Laat minstens twee gerechten een ingrediënt delen, en benoem dat in de body.
  Dat is de belofte van een weekmenu: je koopt minder en gooit niets weg.

Elk item krijgt een `toelichting` van één zin die iets *praktisch* zegt — wanneer
je begint, wat je vooruit kunt doen, wat je erbij eet. Geen herhaling van de
receptbeschrijving.

## Stap 4 — Ontbrekende recepten

Bestaat een gerecht dat je wilt opnemen nog niet, roep dan de skill
`nieuw-recept` aan en schrijf het eerst. Verwijs nooit naar een `pad` dat niet
bestaat: de link-checker geeft dan een bouwfout.

Controleer alle paden:

```
grep "pad:" content/weekmenu/<bestand>.md
ls content/recepten/
```

## Stap 5 — Zoekwoorden

Het primaire zoekwoord van een weekmenu is bijna altijd een variant op
`italiaans weekmenu`, `weekmenu italiaans koken` of `italiaanse recepten week`.
Dat is bewust: elke week versterkt dezelfde term met verse content. Varieer de
secundaire termen wel met het thema van de week.

`title` volgt het patroon `"Weekmenu <nr>: <thema>"`. De dubbele punt maakt de
aanhalingstekens verplicht.

## Stap 6 — Producten uit de webshop

Vul `producten` met drie tot vijf items die over meerdere gerechten van de week
gebruikt worden. Het veld `waarom` verwijst hier naar de dag, niet naar
productkenmerken: "Je hebt ze deze week drie keer nodig. Koop een tray."

Zelfde velden als bij een recept, `variantId` incluis - zie
`.claude/skills/nieuw-recept/references/frontmatter.md`. Zonder dat ID valt het
product buiten de knop "alles in winkelmand" en toont de sectie op het weekmenu
iets anders dan op een recept.

De boodschappenlijst met alle ingrediënten van de week wordt automatisch
opgebouwd uit de recepten; die schrijf je niet zelf.

## Stap 7 — Verifiëren

```
pnpm generate
```

Let op `Failing Pages: 0`. De link-checker vindt elk kapot `pad`. Meld daarna
kort welk thema je koos, hoe de week is opgebouwd en welke foto er nog ontbreekt.
