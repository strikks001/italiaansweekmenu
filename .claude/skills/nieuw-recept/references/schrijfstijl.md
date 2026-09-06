# Schrijfstijl italiaansweekmenu

Deze gids is afgeleid uit de vijf basisrecepten. Volg hem letterlijk; consistentie
is belangrijker dan een mooie vondst.

## Toon

Je schrijft als een Nederlandse vrouw die Napels heeft leren kennen via de
familie van haar Italiaanse vriend, vooral via zijn moeder in de keuken, en die
daarnaast vaak op vakantie is geweest in Italië. Dat perspectief is de stem,
**niet de inhoud**: noem die vriend, zijn familie of de relatie nooit in een
recept. Het blijkt uit hoe je schrijft, niet uit wat je vertelt.

Vriendelijk, alsof je het aan een vriend uitlegt die het thuis gaat maken.
Niet zakelijk, maar ook niet overdreven: geen enthousiasme dat de lezer moet
overtuigen, wel de rust van iemand die weet hoe het gaat.

- **Wel:** "Die 30 minuten zouten zijn het enige wat dit recept van je
  vraagt, en je proeft het verschil meteen."
- **Wel:** "In Napels doen ze dit zonder na te denken; hier moet je er even
  aan wennen dat de saus zo kort kookt."
- **Niet:** "Vergeet niet om de aubergine even te zouten, dat is best
  belangrijk!"
- **Niet:** "Dit is echt het allerlekkerste wat je ooit gaat eten."

Geen uitroeptekens. Geen "heerlijk", "verrukkelijk", "smullen", "in een
handomdraai". Geen emoji. Geen tweede persoon meervoud ("jullie").

Persoonlijke herinneringen en anekdotes staan er alleen in als de gebruiker ze
zelf aanlevert. Verzin er nooit een.

## Vorm

- Spreek de lezer aan met **je**, nooit met **u**.
- Actieve zinnen. Vermijd "wordt toegevoegd", schrijf "voeg toe".
- Hoeveelheden altijd in cijfers, ook in de lopende tekst: "200 g", "10
  minuten", "2 tenen knoflook". Andere getallen schrijf je voluit: "de tweede
  keer", "drie generaties".
- Metrisch systeem, Nederlandse eenheden: g, ml, l, el, tl.
- Italiaanse gerechtnamen niet vertalen, wel uitleggen bij eerste gebruik.
- Nederlandse spelling volgens het Groene Boekje. Diakrieten kloppend: ragù,
  tiramisù, sauté, crème.

## Opbouw van de markdown-body

Elk recept volgt exact deze structuur. Totaal 400 tot 600 woorden.

**Verzin geen tekst.** Alles wat een feit is over herkomst, naam, streek,
traditie of techniek komt uit een bron die je daadwerkelijk hebt opgezocht
(WebSearch). Bruikbare bronnen, in deze volgorde: officiële en
institutionele sites (Accademia Italiana della Cucina, DOP/IGP-consortia,
regionale overheden, Treccani), daarna gerenommeerde Italiaanse kookbronnen
(GialloZafferano, Fatto in casa da Benedetta, Cucchiaio d'Argento, La Cucina
Italiana). Die laatste groep is ook de bron voor de bereiding zelf; zie stap
5a in `SKILL.md` voor wat je wel en niet overneemt. Nederlandse
receptensites zijn geen bron voor herkomst. Vind je niets betrouwbaars, dan
laat je de bewering weg; een kortere sectie is beter dan een verzonnen zin.
Noem de gebruikte bronnen in de oplevering, niet in het recept.

1. **Openingsalinea (2-3 zinnen, geen kop).** Waarom dit gerecht de moeite
   waard is. Begin nooit met "Dit recept voor…". Begin met een observatie, een
   plaats of een tegenstelling.
2. **`## Herkomst of achtergrond`** — één historisch of cultureel gegeven dat
   klopt en waar je een bron voor hebt. Twijfel je, laat het weg.
3. **`## Het ingrediënt of de techniek die het verschil maakt`** — leg uit
   *waarom* iets werkt, niet alleen dat het moet.
4. **`## De meest gemaakte fout`** — één concrete fout en het gevolg ervan.
   Dit is de meest gelezen sectie; besteed er aandacht aan.
5. **Veelgestelde vragen** — precies drie, in de frontmatter onder `vragen`
   (de site toont ze als accordion en zet ze in het FAQ-schema), niet in de
   body. Antwoord van twee tot vier zinnen. Kies vragen die mensen echt
   intypen: vervangingen, vooruit werken, invriezen, apparatuur.

Gebruik geen opsommingstekens in de body. De ingrediënten en stappen staan al
in de frontmatter; de body is proza.

## Stappen (frontmatter `stappen`)

- Vijf tot zeven stappen. Minder is te grof, meer wordt een checklist.
- Elke stap krijgt een `titel` van twee tot vier woorden in de gebiedende wijs
  of als zelfstandig naamwoord ("Aubergine ontvochten", "Drie uur sudderen").
- `tekst`: twee tot vier zinnen, gebiedende wijs.
- Meerdere tips per recept mogen, maar niet op elke stap. De reden hoort in de
  `tekst` van de stap; een `tip` is voor een inzicht dat de stap overstijgt:
  wat de traditie voorschrijft, wat je ook bij andere gerechten gebruikt, wat
  je anders had verwacht. Zonder zo'n inzicht: geen tip.

### De uitlegstandaard: handeling, signaal, reden

Een stap is pas af als hij drie dingen bevat:

1. **Handeling** — wat je doet, met hoeveelheid, vuurstand en tijd.
2. **Signaal** — waaraan je *ziet, ruikt of hoort* dat het klaar is. Een tijd
   alleen is geen signaal: pannen, fornuizen en uien verschillen. "Tien
   minuten" zonder "tot ze glazig zijn en zoet ruiken" is een gok.
3. **Reden** — waarom dit ertoe doet, in één zin, in de `tekst` zelf. Niet
   elke stap heeft een tip nodig; wel een reden.

Daarbovenop: **elk moment waarop het mis kan gaan krijgt een zin.** Wat er
gebeurt als je te ver gaat, en wat je doet als het al gebeurd is. Dit zijn ook
de beste kandidaten voor de FAQ en voor "De meest gemaakte fout".

De test voor elke stap: kan iemand die dit gerecht nooit gezien of geproefd
heeft hem uitvoeren zonder foto en zonder te twijfelen? Zo nee, dan ontbreekt
het signaal.

**Voor** (handeling en tijd, geen signaal, geen reden):

> Snijd ui, wortel en bleekselderij fijn en stoof ze in de olijfolie tien
> minuten op laag vuur tot ze zacht zijn.

**Na** (handeling, signaal, reden, en wat er misgaat):

> Snijd ui, wortel en bleekselderij fijn en stoof ze in de olijfolie op laag
> vuur, 10 tot 15 minuten. Ze zijn klaar als de ui glazig is en de pan zoet
> ruikt, zonder dat er iets kleurt. Krijgt de ui toch een randje, schenk er dan
> een scheut water bij; gekleurde soffritto proef je bitter terug in de hele
> soep.

Signalen die vaak ontbreken en die je actief moet opzoeken: de kleur van
soffritto, de dikte van een saus (streep over de lepel), pasta die net al dente
is en nagaart in de saus, het moment waarop risotto "golft", vlees dat loslaat
van de pan, en deeg dat niet meer plakt.

## Producten (frontmatter `producten`)

Elk ingrediënt dat Spesa da Antonio verkoopt, verwijst naar dat product. Dat
gebeurt op twee plekken:

- `productUrl` op het ingrediënt zelf, zodat de regel in de ingrediëntenlijst
  een link wordt;
- een item in `producten`, zodat het product in de carrousel staat en meegaat
  in de knop "alles in winkelmand".

Controleer dus voor **elk** ingrediënt of het in de webshop staat, niet alleen
voor de blikvangers. Pasta, tomaten, olijfolie, kaas, salumi, bonen, rijst,
azijn, koekjes: als het er is, verwijs je ernaar. Wat de webshop niet verkoopt
(verse groenten, vlees, vis, zuivel) krijgt geen link.

Het veld `waarom` blijft verplicht: één zin over wat dit product in dit gerecht
doet — textuur, vetgehalte, zuurgraad, hoe het zich gedraagt in de pan.

- **Wel:** "De ruwe, bronsgetrokken buitenkant houdt de tomatensaus vast in
  plaats van hem te laten afglijden."
- **Niet:** "Deze heerlijke pasta uit Gragnano mag in geen enkele keuken
  ontbreken."

## Titel en description

- `title`: de Italiaanse gerechtnaam, correct gespeld, zonder toevoegingen.
- `description`: 140 tot 160 tekens. Dit is je meta-description in Google.
  Noem het hoofdzoekwoord, één concreet detail (tijd, techniek of herkomst) en
  geef een reden om te klikken. Geen clickbait.
