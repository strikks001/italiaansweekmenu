# Voedingswaarde per recept

Per portie, berekend uit de ingrediënten zoals ze in de frontmatter staan
(rauw gewogen, gedeeld door `personen`). Ingrediënten die als optioneel zijn
gemarkeerd tellen niet mee. Zout, peper, water en gedroogde kruiden tellen als 0.

## Bronnen

- **CIQUAL 2020** (ANSES, Franse voedingsmiddelentabel, vrij te downloaden
  via ciqual.anses.fr) voor alle generieke ingrediënten. Code en naam staan
  per regel hieronder.
- Drie producten staan niet in CIQUAL en komen van fabrikantetiketten:
  ricotta salata (Humanitas-encyclopedie), melanzane a filetti sott'olio
  (gemiddelde van twee Italiaanse etiketten), friselle integrali
  (gemiddelde van drie Italiaanse etiketten).

## Aannames

- 1 el olie = 14 g, 1 el tomatenpuree = 15 g, kleine ui 60 g, rode ui 80 g,
  wortel 60 g, stengel bleekselderij 40 g, teen knoflook 5 g, bosje basilicum 20 g.
- Gefrituurde aubergine (Norma): 15 % van het rauwe gewicht aan opgenomen
  frituurolie. Dat is een schatting; aubergine zuigt veel olie op.
- Wijn telt volledig mee, ook al verdampt een deel van de alcohol.
- Uitgelekte gewichten: gepelde tomaten 240 g per blik van 400 g,
  melanzane 180 g per pot van 280 g (etiket D'Amico).
- Bolognese: rundergehakt met 15 % vet, zoals "niet te mager" in het recept.

Ontbreekt een ingrediënt of wijzigt een hoeveelheid, reken dan de regel
opnieuw uit met dezelfde bron en werk `voedingswaarde` in de frontmatter bij.

## Berekening

```
## orecchiette-salmone-e-piselli per 4
  orecchiette                        400 g  1344 kcal  CIQUAL 9810 Pâtes sèches standard, crues
  zalmfilet                          300 g   582 kcal  CIQUAL 26036 Saumon, cru, élevage
  doperwten                          200 g   163 kcal  CIQUAL 20036 Petits pois, appertisés, égouttés
  kookroom                           250 g   376 kcal  CIQUAL 19436 Crème de lait, 15 à 20% MG, légère, fluide (kcal uit macro's)
  sjalot                              40 g    25 kcal  CIQUAL 20097 Échalote, crue
  olijfolie 2 el                      28 g   252 kcal  CIQUAL 17270 Huile d'olive vierge extra
  (Parmigiano is optioneel en telt niet mee)
  => per portie {'kcal': 686, 'P': 32, 'C': 75, 'F': 27}
## melanzane-a-funghetto per 4
  aubergine rauw                     700 g   107 kcal  CIQUAL 20053 Aubergine, crue (kcal uit macro's)
  opgenomen frituurolie 15%          105 g   946 kcal  CIQUAL 17440 Huile de tournesol
  olijfolie 2 el                      28 g   252 kcal  CIQUAL 17270 Huile d'olive vierge extra
  pomodorini uit blik                400 g   104 kcal  CIQUAL 20169 Tomate, pulpe, appertisée
  knoflook                            10 g    11 kcal  CIQUAL 11000 Ail, cru
  basilicum                           10 g     3 kcal  CIQUAL 11033 Basilic, frais
  => per portie {'kcal': 356, 'P': 3, 'C': 8, 'F': 34}
```
