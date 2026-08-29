# Schrijfstijl italiaansweekmenu

Deze gids is afgeleid uit de vijf basisrecepten. Volg hem letterlijk; consistentie
is belangrijker dan een mooie vondst.

## Toon

Zakelijk-warm en stellig. Je schrijft als iemand die vaak in Italië gekookt heeft
en weet waarom dingen werken, niet als iemand die een recept overschrijft.

- **Wel:** "Die dertig minuten zouten zijn het enige wat dit recept van je vraagt."
- **Niet:** "Vergeet niet om de aubergine even te zouten, dat is best belangrijk!"

Geen uitroeptekens. Geen "heerlijk", "verrukkelijk", "smullen", "in een handomdraai".
Geen emoji. Geen tweede persoon meervoud ("jullie").

## Vorm

- Spreek de lezer aan met **je**, nooit met **u**.
- Actieve zinnen. Vermijd "wordt toegevoegd", schrijf "voeg toe".
- Hoeveelheden in de lopende tekst schrijf je voluit ("dertig minuten"), in de
  frontmatter in cijfers.
- Metrisch systeem, Nederlandse eenheden: g, ml, l, el, tl.
- Italiaanse gerechtnamen niet vertalen, wel uitleggen bij eerste gebruik.
- Nederlandse spelling volgens het Groene Boekje. Diakrieten kloppend: ragù,
  tiramisù, sauté, crème.

## Opbouw van de markdown-body

Elk recept volgt exact deze structuur. Totaal 400 tot 600 woorden.

1. **Openingsalinea (2-3 zinnen, geen kop).** Waarom dit gerecht de moeite waard
   is. Begin nooit met "Dit recept voor…". Begin met een observatie, een plaats
   of een tegenstelling.
2. **`## Herkomst of achtergrond`** — één historisch of cultureel gegeven dat
   klopt. Geen verzonnen anekdotes; twijfel je, laat het weg.
3. **`## Het ingrediënt of de techniek die het verschil maakt`** — leg uit
   *waarom* iets werkt, niet alleen dat het moet.
4. **`## De meest gemaakte fout`** — één concrete fout en het gevolg ervan.
   Dit is de meest gelezen sectie; besteed er aandacht aan.
5. **`## Veelgestelde vragen`** — precies drie vragen, vetgedrukt, met een
   antwoord van twee tot vier zinnen. Kies vragen die mensen echt intypen:
   vervangingen, vooruit werken, invriezen, apparatuur.

Gebruik geen opsommingstekens in de body. De ingrediënten en stappen staan al
in de frontmatter; de body is proza.

## Stappen (frontmatter `stappen`)

- Vijf tot zeven stappen. Minder is te grof, meer wordt een checklist.
- Elke stap krijgt een `titel` van twee tot vier woorden in de gebiedende wijs
  of als zelfstandig naamwoord ("Aubergine ontvochten", "Drie uur sudderen").
- `tekst`: twee tot vier zinnen, gebiedende wijs.
- Geef twee tot drie stappen een `tip`. Een tip legt uit *waarom*, herhaalt nooit
  de stap. Zonder een echt inzicht: geen tip.

## Producten (frontmatter `producten`)

Twee producten per recept, nooit meer. Het veld `waarom` is verplicht en bevat
één zin die een functioneel verschil benoemt — textuur, vetgehalte, zuurgraad.

- **Wel:** "De ruwe, bronsgetrokken buitenkant houdt de tomatensaus vast in
  plaats van hem te laten afglijden."
- **Niet:** "Deze heerlijke pasta uit Gragnano mag in geen enkele keuken ontbreken."

Verwijs alleen naar een product als het echt uitmaakt. Bij een recept waarin
het merk niet telt, laat je `producten` leeg.

## Titel en description

- `title`: de Italiaanse gerechtnaam, correct gespeld, zonder toevoegingen.
- `description`: 140 tot 160 tekens. Dit is je meta-description in Google.
  Noem het hoofdzoekwoord, één concreet detail (tijd, techniek of herkomst) en
  geef een reden om te klikken. Geen clickbait.
