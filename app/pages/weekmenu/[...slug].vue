<script setup lang="ts">
const route = useRoute()
const site = useSiteConfig()

const { data } = await useAsyncData(`weekmenu:${route.path}`, () =>
  queryCollection('weekmenus').path(route.path).first()
)

if (!data.value || data.value.concept) {
  throw createError({ statusCode: 404, statusMessage: 'Weekmenu niet gevonden', fatal: true })
}

const menu = data.value

// Frontmatter holds paths only; here we fetch the recipes so the agenda can
// show title, photo and cooking time without duplicating them.
const { data: recipes } = await useAsyncData(`weekmenu-recipes:${route.path}`, () =>
  queryCollection('recepten')
    .where('path', 'IN', menu.recepten.map(r => r.pad))
    .all()
)

const days = computed(() => groupByDay(menu, recipes.value))
const courses = computed(() => days.value.flatMap(d => d.courses))
const recipeCount = computed(() => courses.value.filter(c => c.recipe).length)
const filledDays = computed(() => days.value.filter(d => d.courses.length).length)

const period = weekPeriod(menu.jaar, menu.week)
const absoluteImage = new URL(menu.afbeelding, site.url).toString()
const pageUrl = new URL(route.path, site.url).toString()
const products = menu.producten ?? []

useSeoMeta({
  title: menu.seo?.title || menu.title,
  description: menu.seo?.description || menu.description,
  ogType: 'article',
  ogImage: absoluteImage,
  twitterCard: 'summary_large_image',
  articlePublishedTime: new Date(menu.gepubliceerd).toISOString()
})

useSchemaOrg([
  defineArticle({
    headline: menu.title,
    description: menu.description,
    image: absoluteImage,
    datePublished: new Date(menu.gepubliceerd).toISOString(),
    dateModified: menu.gewijzigd ? new Date(menu.gewijzigd).toISOString() : undefined,
    keywords: [menu.zoekwoorden.primair, ...(menu.zoekwoorden.secundair ?? [])]
  }),
  // ItemList tells Google this page is a curated set of recipes.
  defineItemList({
    name: menu.title,
    itemListElement: courses.value
      .filter(c => c.recipe)
      .map(c => ({ name: c.recipe!.title, url: c.path }))
  }),
  defineBreadcrumb({
    itemListElement: [
      { name: 'Home', item: '/' },
      { name: 'Weekmenu', item: '/weekmenu' },
      { name: menu.title }
    ]
  })
])
</script>

<template>
  <UContainer class="py-8 lg:py-12">
    <UBreadcrumb
      :items="[{ label: 'Home', to: '/' }, { label: 'Weekmenu', to: '/weekmenu' }, { label: menu.title }]"
      class="mb-6"
    />

    <header class="mx-auto max-w-3xl text-center">
      <p class="text-sm font-medium uppercase tracking-widest text-secondary">
        Week {{ menu.week }} · {{ period }}
      </p>
      <h1 class="mt-3 text-3xl sm:text-4xl lg:text-5xl">
        {{ menu.title }}
      </h1>
      <p class="mt-4 text-lg text-muted">
        {{ menu.description }}
      </p>

      <div class="mt-6 flex justify-center">
        <ShareButtons
          :title="menu.title"
          :url="pageUrl"
          :image="absoluteImage"
        />
      </div>
    </header>

    <!-- The agenda sits up top: this is what people open the page for. -->
    <section
      class="mx-auto mt-10 max-w-3xl"
      aria-labelledby="menu"
    >
      <h2
        id="menu"
        class="text-2xl"
      >
        {{ filledDays }} avonden, {{ recipeCount }} recepten
      </h2>
      <p class="mt-1 text-muted">
        Kies een dag om het recept te openen.
      </p>

      <WeekAgenda
        :days="days"
        class="mt-5"
      />
    </section>

    <div class="prose dark:prose-invert mx-auto mt-12 max-w-3xl">
      <ContentRenderer :value="menu" />
    </div>

    <div class="mx-auto mt-12 max-w-3xl">
      <ProductList
        :products="products"
        title="Boodschappenlijst bij dit weekmenu"
      />
    </div>
  </UContainer>
</template>
