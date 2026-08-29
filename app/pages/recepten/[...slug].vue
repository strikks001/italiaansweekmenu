<script setup lang="ts">
const route = useRoute()
const site = useSiteConfig()

// queryCollection is typeveilig: 'recepten' komt uit content.config.ts,
// dus TypeScript kent alle velden die we daar gedefinieerd hebben.
const { data } = await useAsyncData(`recept:${route.path}`, () =>
  queryCollection('recepten').path(route.path).first()
)

if (!data.value || data.value.concept) {
  throw createError({ statusCode: 404, statusMessage: 'Recept niet gevonden', fatal: true })
}

const r = data.value

// Velden met een .default() in het Zod-schema zijn in het gegenereerde type
// optioneel: de default wordt pas bij het inlezen toegepast. Hier maken we ze
// expliciet, zodat het sjabloon met echte waarden werkt.
const personen = r.personen ?? 4
const moeilijkheid = r.moeilijkheid ?? 'makkelijk'
const producten = r.producten ?? []
const dieet = r.dieet ?? []

// Gerelateerde recepten uit dezelfde gang - houdt bezoekers op de site
// en verdeelt interne linkwaarde over je hele receptenarchief.
const { data: gerelateerd } = await useAsyncData(`gerelateerd:${route.path}`, () =>
  queryCollection('recepten')
    .where('gang', '=', r.gang)
    .where('path', '<>', r.path)
    .where('concept', '=', false)
    .order('gepubliceerd', 'DESC')
    .limit(3)
    .all()
)

const totaleTijd = r.voorbereidingstijd + r.bereidingstijd
const absoluteAfbeelding = new URL(r.afbeelding, site.url).toString()

// Platte lijst met ingrediënten voor schema.org: Google verwacht strings.
const v = r.voedingswaarde
const voeding = v
  ? {
      '@type': 'NutritionInformation' as const,
      ...(v.calorieen ? { calories: `${v.calorieen} kcal` } : {}),
      ...(v.eiwitten ? { proteinContent: `${v.eiwitten} g` } : {}),
      ...(v.koolhydraten ? { carbohydrateContent: `${v.koolhydraten} g` } : {}),
      ...(v.vetten ? { fatContent: `${v.vetten} g` } : {})
    }
  : undefined

const ingredientRegels = r.ingredienten.flatMap(groep =>
  groep.items.map(i =>
    [i.hoeveelheid, i.eenheid, i.naam].filter(Boolean).join(' ')
  )
)

useSeoMeta({
  title: r.seo?.title || r.title,
  description: r.seo?.description || r.description,
  ogType: 'article',
  ogTitle: r.seo?.title || r.title,
  ogDescription: r.seo?.description || r.description,
  ogImage: absoluteAfbeelding,
  twitterCard: 'summary_large_image',
  articlePublishedTime: new Date(r.gepubliceerd).toISOString(),
  articleModifiedTime: r.gewijzigd ? new Date(r.gewijzigd).toISOString() : undefined
})

// Dit blok is wat Google leest om een rich result te tonen: foto, kooktijd
// en ingrediënten direct in de zoekresultaten.
useSchemaOrg([
  defineRecipe({
    name: r.title,
    description: r.description,
    image: absoluteAfbeelding,
    datePublished: new Date(r.gepubliceerd).toISOString(),
    prepTime: isoDuur(r.voorbereidingstijd),
    cookTime: isoDuur(r.bereidingstijd),
    totalTime: isoDuur(totaleTijd),
    recipeYield: `${personen} personen`,
    recipeCategory: r.gang,
    recipeCuisine: 'Italiaans',
    keywords: [r.zoekwoorden.primair, ...(r.zoekwoorden.secundair ?? [])],
    recipeIngredient: ingredientRegels,
    recipeInstructions: r.stappen.map(s => defineHowToStep({
      name: s.titel,
      text: s.tekst
    })),
    ...(voeding ? { nutrition: voeding } : {})
  }),
  defineBreadcrumb({
    itemListElement: [
      { name: 'Home', item: '/' },
      { name: 'Recepten', item: '/recepten' },
      { name: r.title }
    ]
  })
])

const kruimels = [
  { label: 'Home', to: '/' },
  { label: 'Recepten', to: '/recepten' },
  { label: r.title }
]
</script>

<template>
  <UContainer class="py-8 lg:py-12">
    <UBreadcrumb
      :items="kruimels"
      class="mb-6"
    />

    <header class="mx-auto max-w-3xl text-center">
      <div class="flex flex-wrap items-center justify-center gap-2">
        <UBadge
          :label="r.gang"
          color="primary"
          variant="subtle"
          class="capitalize"
        />
        <UBadge
          v-if="r.regio"
          :label="r.regio"
          color="neutral"
          variant="subtle"
        />
        <UBadge
          v-for="d in dieet"
          :key="d"
          :label="d"
          color="secondary"
          variant="subtle"
          class="capitalize"
        />
      </div>

      <h1 class="mt-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
        {{ r.title }}
      </h1>
      <p class="mt-4 text-lg text-muted">
        {{ r.description }}
      </p>
    </header>

    <NuxtImg
      :src="r.afbeelding"
      :alt="r.afbeeldingAlt"
      width="1200"
      height="675"
      sizes="100vw md:768px lg:1024px"
      format="webp"
      preload
      class="mx-auto mt-8 aspect-video w-full max-w-4xl rounded-2xl object-cover"
    />

    <div class="mx-auto mt-8 max-w-4xl">
      <ReceptMeta
        :voorbereidingstijd="r.voorbereidingstijd"
        :bereidingstijd="r.bereidingstijd"
        :personen="personen"
        :moeilijkheid="moeilijkheid"
      />
    </div>

    <!-- De markdown-body: het verhaal, de context en de achtergrond bij het
         recept. Dit is waar de meeste SEO-waarde zit. -->
    <div class="prose dark:prose-invert mx-auto mt-10 max-w-3xl">
      <ContentRenderer :value="r" />
    </div>

    <div class="mx-auto mt-12 grid max-w-4xl gap-10 lg:grid-cols-[320px_1fr] lg:gap-12">
      <ReceptIngredienten
        :groepen="r.ingredienten"
        :personen="personen"
      />
      <ReceptStappen :stappen="r.stappen" />
    </div>

    <div class="mx-auto mt-12 max-w-4xl">
      <ProductLijst :producten="producten" />
    </div>

    <section
      v-if="gerelateerd?.length"
      class="mx-auto mt-16 max-w-6xl"
    >
      <h2 class="text-2xl font-bold">
        Meer <span class="capitalize">{{ r.gang }}</span>
      </h2>
      <div class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <ReceptKaart
          v-for="item in gerelateerd"
          :key="item.path"
          :recept="item"
        />
      </div>
    </section>
  </UContainer>
</template>
