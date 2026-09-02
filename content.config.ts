import { defineCollection, defineContentConfig, z } from '@nuxt/content'

/**
 * Zoekwoordonderzoek per recept. Dit staat bewust IN de content, zodat je
 * later kunt terugzien waarom een recept geschreven is en op welke term
 * het moet ranken. De generator vult dit in; jij kunt het bijsturen.
 */
const zoekwoorden = z.object({
  primair: z.string().describe('Hoofdzoekwoord, exact zoals mensen het intypen'),
  secundair: z.array(z.string()).default([]).describe('Ondersteunende termen die in de tekst verwerkt zijn'),
  zoekintentie: z.enum(['informationeel', 'navigatie', 'commercieel', 'transactioneel']).default('informationeel'),
  maandelijksVolume: z.number().optional().describe('Geschat zoekvolume NL per maand'),
  moeilijkheid: z.number().min(0).max(100).optional().describe('Ranking-moeilijkheid 0-100')
})

/**
 * Verwijzing naar een product op spesadaantonio.nl. Zo koppel je een recept
 * aan de webshop zonder de URL's door je hele site te verspreiden.
 */
const product = z.object({
  naam: z.string(),
  url: z.string().describe('Volledige URL naar het product op spesadaantonio.nl'),
  afbeelding: z.string().optional(),
  prijs: z.string().optional(),
  variantId: z.string().optional().describe('Shopify variant-ID (alleen cijfers) — nodig om alles in één keer in de winkelmand te leggen'),
  waarom: z.string().optional().describe('Eén zin: waarom juist dit product voor dit recept')
})

const ingredient = z.object({
  hoeveelheid: z.string().optional().describe('Bijv. "250" of "een snuf"'),
  eenheid: z.string().optional().describe('Bijv. "g", "ml", "el", "tl"'),
  naam: z.string(),
  opmerking: z.string().optional().describe('Bijv. "op kamertemperatuur"'),
  productUrl: z.string().optional().describe('Link naar dit ingrediënt in de webshop')
})

const ingredientGroep = z.object({
  groep: z.string().optional().describe('Bijv. "Voor de saus" - laat leeg bij één lijst'),
  items: z.array(ingredient)
})

/**
 * Veelgestelde vragen bij een recept. Als aparte velden, niet als kopjes in
 * de body: zo blijft de accordion één component en kan Google de vragen ook
 * los van de tekst lezen.
 */
const vraag = z.object({
  vraag: z.string(),
  antwoord: z.string().describe('Mag inline markdown bevatten, bijv. *cursief*')
})

const stap = z.object({
  titel: z.string().optional().describe('Korte kop, verschijnt in Google als HowTo-stap'),
  tekst: z.string(),
  tip: z.string().optional()
})

export default defineContentConfig({
  collections: {
    // ---------------------------------------------------------------- recepten
    recepten: defineCollection({
      type: 'page',
      source: 'recepten/**/*.md',
      schema: z.object({
        gepubliceerd: z.date().describe('Publicatiedatum, wordt datePublished in schema.org'),
        gewijzigd: z.date().optional(),
        concept: z.boolean().default(false).describe('true = niet zichtbaar op de site'),

        afbeelding: z.string().editor({ input: 'media' }),
        afbeeldingAlt: z.string().describe('Beschrijf wat je ziet - voor toegankelijkheid én afbeeldingszoekresultaten'),

        gang: z.enum(['antipasto', 'primo', 'secondo', 'contorno', 'dolce', 'basis']),
        seizoen: z.array(z.enum(['lente', 'zomer', 'herfst', 'winter'])).default([]),
        dieet: z.array(z.enum(['vegetarisch', 'veganistisch', 'glutenvrij', 'lactosevrij'])).default([]),

        voorbereidingstijd: z.number().describe('Minuten voorbereiden'),
        bereidingstijd: z.number().describe('Minuten koken/bakken'),
        personen: z.number().default(4),
        moeilijkheid: z.enum(['makkelijk', 'gemiddeld', 'uitdagend']).default('makkelijk'),

        ingredienten: z.array(ingredientGroep),
        stappen: z.array(stap),

        voedingswaarde: z.object({
          calorieen: z.number().optional(),
          eiwitten: z.number().optional(),
          koolhydraten: z.number().optional(),
          vetten: z.number().optional()
        }).optional(),

        producten: z.array(product).default([]).describe('Producten uit de webshop die bij dit recept horen'),
        vragen: z.array(vraag).default([]).describe('Veelgestelde vragen, getoond als accordion'),
        zoekwoorden: zoekwoorden
      })
    }),

    // --------------------------------------------------------------- weekmenus
    weekmenus: defineCollection({
      type: 'page',
      source: 'weekmenu/**/*.md',
      schema: z.object({
        gepubliceerd: z.date(),
        gewijzigd: z.date().optional(),
        concept: z.boolean().default(false),

        jaar: z.number(),
        week: z.number().min(1).max(53),
        thema: z.string().describe('Bijv. "Sicilië in de zomer"'),

        afbeelding: z.string().editor({ input: 'media' }),
        afbeeldingAlt: z.string(),

        // Verwijst naar het `path` van een recept, bijv. "/recepten/pasta-alla-norma"
        recepten: z.array(z.object({
          dag: z.enum(['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag']),
          pad: z.string(),
          toelichting: z.string().optional()
        })),

        producten: z.array(product).default([]),
        zoekwoorden: zoekwoorden
      })
    }),

    // ------------------------------------------------------------ losse pagina's
    paginas: defineCollection({
      type: 'page',
      source: {
        include: '**/*.md',
        exclude: ['recepten/**', 'weekmenu/**']
      },
      schema: z.object({
        gewijzigd: z.date().optional()
      })
    })
  }
})
