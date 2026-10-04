# Ingrediëntenlexicon

Eén naam per ingrediënt, altijd dezelfde. De boodschappenlijst van een
weekmenu voegt samen op naam plus eenheid; elke afwijkende spelling wordt een
extra regel. Controle: `pnpm ingredienten` (alle recepten) of
`node scripts/ingredienten-check.mjs <pad>` (één recept). Het script leest de
tabellen hieronder, dus een nieuw ingrediënt voeg je **hier** toe.

## Regels

1. `naam` is alleen de productnaam. Hoeveelheid in `hoeveelheid`, eenheid in
   `eenheid`, bereiding en toelichting in `opmerking`.
   Niet `naam: "2 tenen knoflook, fijngesneden"` maar
   `hoeveelheid: "2"`, `eenheid: tenen`, `naam: knoflook`, `opmerking: "fijngesneden"`.
2. Enkelvoud en meervoud mogen allebei zoals het leest bij de hoeveelheid
   ("1 courgette", "2 courgettes"); de lijst vouwt ze samen. De tabel noemt
   één vorm.
3. Geen alternatieven in de naam ("carnaroli of arborio"). Kies er één; het
   alternatief hoort in `opmerking` of in de FAQ.
4. Zout, zwarte peper en nootmuskaat: zonder `hoeveelheid` en `eenheid`. De
   lijst toont ze als één regel zonder aantal. Uitzondering: een echte
   hoeveelheid in gram of theelepels, zoals zout in brooddeeg; die mag.
5. Een ingrediënt dat Spesa verkoopt krijgt `productUrl`; de naam blijft de
   generieke naam, niet de merknaam. Het merk staat in `producten`.
6. Kleine letters, behalve eigennamen: Parmigiano Reggiano, prosciutto di
   Parma, San Marzano.

Eenheden die bestaan: `g`, `kg`, `ml`, `l`, `el`, `tl`, `tenen`, `stengels`,
`takjes`, `blaadjes`, `plakken`, `sneden`, `bosje`, `korst`, `zakje`, `blik`, `pot`.
Geen eenheid betekent stuks. Kolom "eenheden" hieronder: `-` is stuks.

## Groenten en verse kruiden

| naam | eenheden | ook geschreven als |
|---|---|---|
| aubergine | - | |
| courgette | - | |
| gele ui | - | ui |
| rode ui | - | |
| sjalot | - | |
| knoflook | tenen | tenen knoflook, teen knoflook, teentje knoflook |
| winterwortel | - | wortel |
| bleekselderij | stengels | stengels bleekselderij, selderij |
| savooiekool | g | |
| groene bonen | g | sperziebonen |
| vastkokende aardappel | - , g | aardappel |
| trostomaten | g, - | rijpe trostomaten |
| basilicum | bosje, blaadjes, - | verse basilicum |
| salie | blaadjes | salieblaadjes, verse salie |
| rozemarijn | takjes | takjes rozemarijn, verse rozemarijn |
| laurier | blaadjes | laurierblaadjes, laurierblad |
| peterselie | bosje, el | platte peterselie |
| citroen | - | |

## Voorraadkast

| naam | eenheden | ook geschreven als |
|---|---|---|
| extra vergine olijfolie | el, ml, - | olijfolie, extra vierge olijfolie |
| zonnebloemolie | ml | frituurolie, arachideolie |
| gepelde tomaten | g, blik | pelati, tomaten uit blik |
| passata | g, ml, fles | tomatenpassata, passata di pomodoro, gezeefde tomaten |
| pomodorini uit blik | g, blik | pomodorini interi, kleine tomaatjes uit blik, cherrytomaten uit blik |
| doperwten | g, pot | piselli, erwten, diepvriesdoperwten |
| peperoncino | tl, - | chilivlokken, gedroogde peperoncino, rode pepervlokken |
| borlottibonen | g, blik | borlottibonen uit blik |
| zwarte olijven | g | |
| groene olijven | g | groene olijven zonder pit |
| melanzane sott'olio | pot, g | aubergine in olie, melanzane a filetti, gegrilde aubergine in olie |
| groentebouillon | ml, l | |
| runderbouillon | ml, l | |
| kippenbouillon | ml, l | |
| droge witte wijn | ml | witte wijn |
| droge rode wijn | ml | rode wijn |
| fijne kristalsuiker | g | suiker, kristalsuiker |
| ongezoet cacaopoeder | g | cacao, cacaopoeder |
| saffraan | zakje, g | saffraandraadjes |
| sterke espresso | ml | espresso, koffie |
| zout | -, g, tl | grof zeezout, zeezout, fijn zout |
| water | ml, l, - | lauw water, koud water |
| bloem tipo 00 | g | farina 00, bloem, tarwebloem |
| semola rimacinata | g | semola, griesmeel van harde tarwe |
| droge gist | g, zakje | gedroogde gist, instantgist |
| verse gist | g | |
| gedroogde oregano | tl, el | oregano |
| tomatenpuree | el, g | concentrato di pomodoro, dubbel geconcentreerde tomatenpuree, doppio concentrato |
| zwarte peper | - | peper, versgemalen zwarte peper |
| nootmuskaat | - | |

## Pasta, rijst en brood

| naam | eenheden | ook geschreven als |
|---|---|---|
| rigatoni | g | rigatoni of maccheroni |
| orecchiette | g | orecchiette pugliesi |
| ditalini | g | ditalini of gebroken spaghetti |
| spaghetti | g | |
| tagliatelle | g | droge tagliatelle, tagliatelle nidi |
| verse tagliatelle | g | tagliatelle all'uovo |
| carnaroli rijst | g | carnaroli of arborio rijst, risottorijst, arborio rijst |
| savoiardi | g, - | lange vingers |
| landbrood | sneden | sneden stevig landbrood, brood |
| friselle | -, g | freselle, frisella, fresella, friselle integrali |

## Zuivel en eieren

| naam | eenheden | ook geschreven als |
|---|---|---|
| roomboter | g | boter, koude roomboter |
| Parmigiano Reggiano | g, korst | parmezaan, parmezaanse kaas, parmigiano |
| ricotta salata | g | |
| mascarpone | g | |
| volle melk | ml | melk |
| eieren | - | ei |
| mozzarella | g, - | mozzarella di bufala, bol mozzarella |
| kookroom | ml | panna, panna da cucina, room, slagroom |

## Vlees en vis

| naam | eenheden | ook geschreven als |
|---|---|---|
| rundergehakt | g | gehakt |
| pancetta | g | |
| kalfsoesters | - | dunne kalfsoesters, kalfslapjes |
| prosciutto di Parma | plakken, g | plakken prosciutto di Parma, parmaham |
| kippendijen | - , g | kippendijen met bot en vel, kippendij |
| salsiccia | g, - | italiaanse worst, salsiccia piccante, salsiccia stick, verse salsiccia |
| tonijnfilets | pot, g | tonijn, tonijn in olijfolie, filetti di tonno |
| zalmfilet | g | zalm, zalmmoot, verse zalm |
