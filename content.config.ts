import { defineCollection, defineContentConfig, z } from '@nuxt/content'
import { GANGEN } from './app/utils/gang'

/**
 * Keyword research per recipe. Deliberately IN the content, so it stays
 * visible later why a recipe was written and what it should rank for.
 */
const zoekwoorden = z.object({
  primair: z.string().describe('Hoofdzoekwoord, exact zoals mensen het intypen'),
  secundair: z.array(z.string()).default([]).describe('Ondersteunende termen die in de tekst verwerkt zijn'),
  zoekintentie: z.enum(['informationeel', 'navigatie', 'commercieel', 'transactioneel']).default('informationeel'),
  maandelijksVolume: z.number().optional().describe('Geschat zoekvolume NL per maand'),
  moeilijkheid: z.number().min(0).max(100).optional().describe('Ranking-moeilijkheid 0-100')
})

/**
 * A product on spesadaantonio.nl. Links a recipe to the shop without
 * scattering URLs across the site.
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

/** Fields, not headings in the body: Google then reads them apart from the text. */
const vraag = z.object({
  vraag: z.string(),
  antwoord: z.string().describe('Mag inline markdown bevatten, bijv. *cursief*')
})

const stap = z.object({
  titel: z.string().optional().describe('Korte kop, verschijnt in Google als HowTo-stap'),
  tekst: z.string(),
  tip: z.string().optional(),
  /** Nested, so an optional photo without alt text cannot happen. */
  afbeelding: z.object({
    src: z.string().editor({ input: 'media' }),
    alt: z.string().describe('Beschrijf wat je ziet - voor toegankelijkheid én afbeeldingszoekresultaten')
  }).optional().describe('Eigen foto van deze stap')
})

export default defineContentConfig({
  collections: {
    // ---------------------------------------------------------------- recepten
    recepten: defineCollection({
      type: 'page',
      // `prefix` keeps the URL flat: the folder name does not belong in it.
      source: GANGEN.map(gang => ({
        include: `recepten/${gang}/*.md`,
        prefix: '/recepten'
      })),
      schema: z.object({
        gepubliceerd: z.date().describe('Publicatiedatum, wordt datePublished in schema.org'),
        gewijzigd: z.date().optional(),
        concept: z.boolean().default(false).describe('true = niet zichtbaar op de site'),

        afbeelding: z.string().editor({ input: 'media' }),
        afbeeldingAlt: z.string().describe('Beschrijf wat je ziet - voor toegankelijkheid én afbeeldingszoekresultaten'),

        gang: z.enum(GANGEN),
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

    // ------------------------------------------------------------ losse pagina's
    paginas: defineCollection({
      type: 'page',
      source: {
        include: '**/*.md',
        exclude: ['recepten/**']
      },
      schema: z.object({
        gewijzigd: z.date().optional()
      })
    })
  }
})
