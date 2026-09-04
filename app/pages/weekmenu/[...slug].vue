<script setup lang="ts">
const route = useRoute()
const site = useSiteConfig()

const { data } = await useAsyncData(`weekmenu:${route.path}`, () =>
  queryCollection('weekmenus').path(route.path).first()
)

// The same rule the overview uses, but here it has to close the door: without
// it a future week keeps its own page, its sitemap entry and its search hit,
// and the menu is public before anyone should know it. The daily rebuild opens
// it on the Friday before its week.
if (!data.value || data.value.concept || !menuVisibleOn(data.value.jaar, data.value.week, todayISO())) {
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

// Neighbours for the week-to-week navigation, and the rest of the archive for
// the suggestions at the bottom.
const { data: siblings } = await useAsyncData(`weekmenu-siblings:${route.path}`, () =>
  queryCollection('weekmenus')
    .where('concept', '=', false)
    .select('path', 'title', 'description', 'afbeelding', 'afbeeldingAlt', 'jaar', 'week')
    .all()
)

const today = useToday()

// Neighbours are filtered too: a link to a week that is not open yet would
// both leak it and lead to a 404.
const ordered = computed(() =>
  (siblings.value ?? [])
    .filter(m => menuVisibleOn(m.jaar, m.week, today.value))
    .sort((a, b) => (a.jaar - b.jaar) || (a.week - b.week))
)

const position = computed(() => ordered.value.findIndex(m => m.path === menu.path))
const previousWeek = computed(() => ordered.value[position.value - 1])
const nextWeek = computed(() => ordered.value[position.value + 1])

const related = computed(() =>
  ordered.value.filter(m => m.path !== menu.path).slice(-3).reverse()
)

const days = computed(() => groupByDay(menu, recipes.value))
const courses = computed(() => days.value.flatMap(d => d.courses))
const recipeCount = computed(() => courses.value.filter(c => c.recipe).length)
const filledDays = computed(() => days.value.filter(d => d.courses.length).length)

const shoppingList = computed(() => buildShoppingList(recipes.value ?? []))

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
  <div>
    <PageBanner
      breed
      :breadcrumb="[{ label: 'Home', to: '/' }, { label: 'Weekmenu', to: '/weekmenu' }, { label: menu.title }]"
    >
      <p class="text-sm font-semibold uppercase tracking-widest">
        Week {{ menu.week }} · {{ period }}
      </p>
      <h1 class="mt-4 text-4xl text-white sm:text-5xl lg:text-6xl">
        {{ menu.title }}
      </h1>
      <p class="print-lead mx-auto mt-4 max-w-2xl text-lg">
        {{ menu.description }}
      </p>

      <PageActions
        :title="menu.title"
        :url="pageUrl"
        :image="absoluteImage"
        tone="banner"
        class="mt-6 justify-center"
      />
    </PageBanner>

    <UContainer class="print-body py-10 lg:py-14">
      <!-- The agenda sits up top: this is what people open the page for. -->
      <PageSection
        :title="`${filledDays} avonden, ${recipeCount} recepten`"
        lead="Kies een dag om het recept te openen."
        :contained="false"
        class="print-roomy mt-10"
      >
        <WeekAgenda :days="days" />
      </PageSection>

      <!-- The point of planning a week: one list to shop from. -->
      <div class="print-break mx-auto mt-12 max-w-4xl">
        <WeekShoppingList :items="shoppingList" />
      </div>

      <div class="print-hide mx-auto mt-12 max-w-4xl">
        <ProseSection as="div">
          <ContentRenderer :value="menu" />
        </ProseSection>
      </div>

      <ProductList :products="products" />

      <!-- A weekly series reads forwards and backwards; without this you have to
         go back to the archive for every step. -->
      <nav
        v-if="previousWeek || nextWeek"
        class="print-hide mx-auto mt-16 grid max-w-4xl gap-3 sm:grid-cols-2"
        aria-label="Andere weken"
      >
        <NuxtLink
          v-if="previousWeek"
          :to="previousWeek.path"
          class="group flex flex-col gap-1 rounded-2xl border border-default p-4 transition hover:border-ceramic-500 hover:shadow-sm"
        >
          <span class="flex items-center gap-1 text-xs uppercase tracking-widest text-muted">
            <UIcon
              name="i-lucide-arrow-left"
              class="size-3 transition group-hover:-translate-x-0.5"
            />
            Week {{ previousWeek.week }}
          </span>
          <span class="font-medium leading-snug group-hover:text-primary">{{ previousWeek.title }}</span>
        </NuxtLink>

        <NuxtLink
          v-if="nextWeek"
          :to="nextWeek.path"
          class="group flex flex-col gap-1 rounded-2xl border border-default p-4 text-right transition hover:border-ceramic-500 hover:shadow-sm sm:col-start-2"
        >
          <span class="flex items-center justify-end gap-1 text-xs uppercase tracking-widest text-muted">
            Week {{ nextWeek.week }}
            <UIcon
              name="i-lucide-arrow-right"
              class="size-3 transition group-hover:translate-x-0.5"
            />
          </span>
          <span class="font-medium leading-snug group-hover:text-primary">{{ nextWeek.title }}</span>
        </NuxtLink>
      </nav>

      <PageSection
        v-if="related.length"
        title="Meer weekmenu's"
        :contained="false"
        class="print-hide mt-16"
      >
        <CardGrid>
          <MediaCard
            v-for="item in related"
            :key="item.path"
            :to="item.path"
            :image="item.afbeelding"
            :alt="item.afbeeldingAlt"
            :title="item.title"
            :description="item.description"
          >
            <template #meta>
              <span class="font-medium uppercase tracking-widest">
                Week {{ item.week }} · {{ item.jaar }}
              </span>
            </template>
          </MediaCard>
        </CardGrid>
      </PageSection>
    </UContainer>
  </div>
</template>
