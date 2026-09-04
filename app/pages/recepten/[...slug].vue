<script setup lang="ts">
const route = useRoute()
const site = useSiteConfig()

const { data } = await useAsyncData(`recipe:${route.path}`, () =>
  queryCollection('recepten').path(route.path).first()
)

if (!data.value || data.value.concept) {
  throw createError({ statusCode: 404, statusMessage: 'Recept niet gevonden', fatal: true })
}

const recipe = data.value

// Fields with a .default() in the Zod schema are optional in the generated
// type: the default is applied at read time, so TypeScript cannot know.
const servings = recipe.personen ?? 4
const difficulty = recipe.moeilijkheid ?? 'makkelijk'
const products = recipe.producten ?? []
const diets = recipe.dieet ?? []

// LIKE against the stored JSON, so the archive stays out of the payload.
const { data: weeks } = await useAsyncData(`recipe-weeks:${route.path}`, () =>
  queryCollection('weekmenus')
    .where('concept', '=', false)
    .where('recepten', 'LIKE', `%"${route.path}"%`)
    .select('path', 'title', 'jaar', 'week')
    .all()
)

const today = useToday()

const weekMenus = computed(() =>
  (weeks.value ?? [])
    .filter(m => menuVisibleOn(m.jaar, m.week, today.value))
    .sort((a, b) => (b.jaar - a.jaar) || (b.week - a.week))
)

const { data: related } = await useAsyncData(`related:${route.path}`, () =>
  queryCollection('recepten')
    .where('gang', '=', recipe.gang)
    .where('path', '<>', recipe.path)
    .where('concept', '=', false)
    .order('gepubliceerd', 'DESC')
    .limit(3)
    .select('path', 'title', 'description', 'afbeelding', 'afbeeldingAlt',
      'gang', 'voorbereidingstijd', 'bereidingstijd')
    .all()
)

// Three cards fit from 1024px; below that it keeps sliding.
const { breakpoints: relatedBreakpoints, ui: relatedUi } = useCarouselFit(
  () => related.value?.length ?? 0,
  3,
  1024
)

const totalMinutes = recipe.voorbereidingstijd + recipe.bereidingstijd
const absoluteImage = new URL(recipe.afbeelding, site.url).toString()
const pageUrl = new URL(route.path, site.url).toString()

// Keeps the screen on while cooking; only offered where the browser supports it.
const wakeLock = useWakeLock()

// schema.org wants plain strings for ingredients.
const ingredientLines = recipe.ingredienten.flatMap(group =>
  group.items.map(i => [i.hoeveelheid, i.eenheid, i.naam].filter(Boolean).join(' '))
)

// schema.org has a fixed diet vocabulary; our own labels mean nothing to it.
const DIETS: Record<string, string> = {
  vegetarisch: 'https://schema.org/VegetarianDiet',
  veganistisch: 'https://schema.org/VeganDiet',
  glutenvrij: 'https://schema.org/GlutenFreeDiet',
  lactosevrij: 'https://schema.org/LowLactoseDiet'
}

const dietUrls = diets.map(d => DIETS[d]).filter(Boolean) as string[]

// Via URL(): the organisation in app.vue gets a normalised @id with a slash,
// which a hand-built reference would miss.
const identity = new URL('#identity', site.url).toString()

const nutrition = recipe.voedingswaarde
const nutritionNode = nutrition
  ? {
      '@type': 'NutritionInformation' as const,
      ...(nutrition.calorieen ? { calories: `${nutrition.calorieen} kcal` } : {}),
      ...(nutrition.eiwitten ? { proteinContent: `${nutrition.eiwitten} g` } : {}),
      ...(nutrition.koolhydraten ? { carbohydrateContent: `${nutrition.koolhydraten} g` } : {}),
      ...(nutrition.vetten ? { fatContent: `${nutrition.vetten} g` } : {})
    }
  : undefined

useSeoMeta({
  title: recipe.seo?.title || recipe.title,
  description: recipe.seo?.description || recipe.description,
  ogType: 'article',
  ogTitle: recipe.seo?.title || recipe.title,
  ogDescription: recipe.seo?.description || recipe.description,
  ogImage: absoluteImage,
  twitterCard: 'summary_large_image',
  articlePublishedTime: new Date(recipe.gepubliceerd).toISOString(),
  articleModifiedTime: recipe.gewijzigd ? new Date(recipe.gewijzigd).toISOString() : undefined
})

// This block decides whether Google shows a rich result with photo and times.
useSchemaOrg([
  defineRecipe({
    name: recipe.title,
    description: recipe.description,
    image: absoluteImage,
    datePublished: new Date(recipe.gepubliceerd).toISOString(),
    ...(recipe.gewijzigd ? { dateModified: new Date(recipe.gewijzigd).toISOString() } : {}),
    prepTime: isoDuration(recipe.voorbereidingstijd),
    cookTime: isoDuration(recipe.bereidingstijd),
    totalTime: isoDuration(totalMinutes),
    recipeYield: `${servings} personen`,
    recipeCategory: gangLabel(recipe.gang),
    recipeCuisine: 'Italiaans',
    keywords: [recipe.zoekwoorden.primair, ...(recipe.zoekwoorden.secundair ?? [])],
    recipeIngredient: ingredientLines,
    recipeInstructions: recipe.stappen.map(s => defineHowToStep({
      name: s.titel,
      text: s.tekst,
      ...(s.afbeelding ? { image: new URL(s.afbeelding.src, site.url).toString() } : {})
    })),
    ...(nutritionNode ? { nutrition: nutritionNode } : {}),
    // schema.org allows these on Recipe, but the module's types cover only a
    // handful of fields. The resolver passes them through regardless.
    ...({
      author: { '@id': identity },
      ...(dietUrls.length ? { suitableForDiet: dietUrls } : {})
    } as object)
  }),
  defineBreadcrumb({
    itemListElement: [
      { name: 'Home', item: '/' },
      { name: 'Recepten', item: '/recepten' },
      { name: recipe.title }
    ]
  }),
  // The questions only attach to the page once it is typed FAQPage; the
  // resolver checks for that before filling mainEntity.
  ...(recipe.vragen.length
    ? [
        defineWebPage({ '@type': ['WebPage', 'FAQPage'] }),
        ...recipe.vragen.map(item => defineQuestion({
          name: item.vraag,
          acceptedAnswer: plainText(item.antwoord)
        }))
      ]
    : [])
])
</script>

<template>
  <div>
    <PageBanner
      breed
      :breadcrumb="[{ label: 'Home', to: '/' }, { label: 'Recepten', to: '/recepten' }, { label: recipe.title }]"
      jump-to="#recept"
      jump-label="Naar de ingrediënten en bereiding"
    >
      <div class="print-pills flex flex-wrap items-center justify-center gap-2">
        <PillBadge tone="white">
          {{ gangLabel(recipe.gang) }}
        </PillBadge>
        <PillBadge
          v-for="d in diets"
          :key="d"
          tone="white"
        >
          {{ d }}
        </PillBadge>
      </div>

      <h1 class="mt-5 text-4xl text-white sm:text-5xl lg:text-6xl">
        {{ recipe.title }}
      </h1>
      <p class="print-lead mx-auto mt-4 max-w-2xl text-lg">
        {{ recipe.description }}
      </p>

      <PageActions
        :title="recipe.title"
        :url="pageUrl"
        :image="absoluteImage"
        tone="banner"
        class="mt-6 justify-center"
      />
    </PageBanner>

    <UContainer class="print-body py-10 lg:py-14">
      <NuxtImg
        :src="recipe.afbeelding"
        :alt="recipe.afbeeldingAlt"
        width="1200"
        height="675"
        sizes="100vw md:768px lg:1024px"
        format="webp"
        preload
        class="print-hide mx-auto mt-8 aspect-video w-full max-w-4xl rounded-2xl object-cover"
      />

      <div class="print-tight mx-auto mt-8 max-w-4xl">
        <RecipeMeta
          :prep-minutes="recipe.voorbereidingstijd"
          :cook-minutes="recipe.bereidingstijd"
          :servings="servings"
          :difficulty="difficulty"
        />
      </div>

      <p
        v-if="weekMenus.length"
        class="print-hide mx-auto mt-4 flex max-w-4xl flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted"
      >
        <UIcon
          name="i-lucide-calendar-days"
          class="size-4 shrink-0"
        />
        <span>Stond op het menu in</span>
        <NuxtLink
          v-for="(m, i) in weekMenus"
          :key="m.path"
          :to="m.path"
          class="font-semibold text-ceramic-700 underline decoration-dotted underline-offset-4 hover:decoration-solid dark:text-ceramic-300"
        >{{ i ? '· ' : '' }}week {{ m.week }}</NuxtLink>
      </p>

      <!-- Recipe before story: someone standing in the kitchen should not have to
         scroll past 500 words of background first. -->
      <div class="print-tight mx-auto mt-10 max-w-4xl">
        <div
          v-if="wakeLock.supported.value"
          class="print-hide mb-6 flex items-center justify-between gap-3 rounded-2xl border-s-2 border-ceramic-500 bg-ceramic-50 px-4 py-2.5 dark:bg-ceramic-950"
        >
          <span class="flex items-center gap-2 text-sm">
            <UIcon
              name="i-lucide-lightbulb"
              class="size-4 text-ceramic-600 dark:text-ceramic-300"
            />
            Scherm aan houden tijdens het koken
          </span>
          <USwitch
            :model-value="wakeLock.active.value"
            aria-label="Scherm aan houden tijdens het koken"
            @update:model-value="wakeLock.toggle()"
          />
        </div>

        <!--
        Block flow on mobile, grid from lg. Both give the sticky ingredient
        panel a container taller than itself, which is what lets it travel:
        on mobile the steps are siblings in the same block, on desktop the grid
        items stretch to the row height. An items-start here would pin the
        panel to its own cell and sticky would do nothing.
      -->
        <div
          id="recept"
          class="print-stack scroll-mt-24 lg:grid lg:grid-cols-[320px_1fr] lg:gap-12"
        >
          <!--
          display:contents on mobile so the panel's containing block is the
          whole column and it can travel past the steps; a real block from lg,
          where it becomes the grid cell that stretches to the row height and
          gives the sticky panel inside it room to move.
        -->
          <div class="contents lg:block">
            <RecipeIngredients
              :groups="recipe.ingredienten"
              :servings="servings"
            />
          </div>
          <!-- Spacing goes on the steps, not on the ingredients: that component's
             root is display:contents, which generates no box and drops margins. -->
          <RecipeSteps
            :steps="recipe.stappen"
            class="mt-10 lg:mt-0"
          />
        </div>

        <!-- Also here, after the recipe: by now you know whether it is worth
           keeping or passing on. -->
        <PageActions
          :title="recipe.title"
          :url="pageUrl"
          :image="absoluteImage"
          class="mt-10 border-t border-default pt-6"
        />
      </div>

      <!-- Visible because it is also in the structured data: Google requires
         marked-up content to appear on the page. -->
      <div
        v-if="nutrition"
        class="print-hide mx-auto mt-12 max-w-4xl"
      >
        <RecipeNutrition :nutrition="nutrition" />
      </div>

      <ProductList :products="products" />

      <section
        v-if="recipe.body"
        class="print-hide mx-auto mt-12 max-w-4xl"
        aria-labelledby="achtergrond"
      >
        <h2
          id="achtergrond"
          class="text-xl"
        >
          Over dit recept
        </h2>
        <div class="prose dark:prose-invert mt-4">
          <ContentRenderer :value="recipe" />
        </div>
      </section>

      <FaqAccordion
        :items="recipe.vragen"
        class="print-hide mx-auto mt-12 max-w-4xl"
      />

      <section
        v-if="related?.length"
        class="print-hide mx-auto mt-16 max-w-4xl"
      >
        <h2 class="text-2xl">
          Meer <span class="first-letter:uppercase">{{ gangLabel(recipe.gang) }}</span>
        </h2>
        <UCarousel
          v-slot="{ item }"
          :items="related"
          :arrows="related.length > 1"
          :breakpoints="relatedBreakpoints"
          :ui="relatedUi"
          class="mt-6"
        >
          <MediaCard
            :to="item.path"
            :image="item.afbeelding"
            :alt="item.afbeeldingAlt"
            :title="item.title"
            :description="item.description"
          >
            <template #meta>
              <PillBadge>{{ gangLabel(item.gang) }}</PillBadge>
              <span>{{ readableDuration(item.voorbereidingstijd + item.bereidingstijd) }}</span>
            </template>
          </MediaCard>
        </UCarousel>
      </section>
    </UContainer>
  </div>
</template>
