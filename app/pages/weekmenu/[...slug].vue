<script setup lang="ts">
const route = useRoute()
const site = useSiteConfig()

const { data: menu } = await useAsyncData(`weekmenu:${route.path}`, () =>
  queryCollection('weekmenus').path(route.path).first()
)

if (!menu.value || menu.value.concept) {
  throw createError({ statusCode: 404, statusMessage: 'Weekmenu niet gevonden', fatal: true })
}

const m = menu.value

// De frontmatter bevat alleen paden. Hier halen we de bijbehorende recepten op
// zodat we titel, foto en kooktijd kunnen tonen zonder die te dupliceren.
const { data: recepten } = await useAsyncData(`weekmenu-recepten:${route.path}`, () =>
  queryCollection('recepten')
    .where('path', 'IN', m.recepten.map(r => r.pad))
    .all()
)

// Zelfde volgorde aanhouden als in het menu (maandag t/m zondag).
const dagen = computed(() =>
  m.recepten.map(item => ({
    ...item,
    recept: recepten.value?.find(r => r.path === item.pad)
  }))
)

const absoluteAfbeelding = new URL(m.afbeelding, site.url).toString()
const producten = m.producten ?? []

useSeoMeta({
  title: m.seo?.title || m.title,
  description: m.seo?.description || m.description,
  ogType: 'article',
  ogImage: absoluteAfbeelding,
  twitterCard: 'summary_large_image',
  articlePublishedTime: new Date(m.gepubliceerd).toISOString()
})

useSchemaOrg([
  defineArticle({
    headline: m.title,
    description: m.description,
    image: absoluteAfbeelding,
    datePublished: new Date(m.gepubliceerd).toISOString(),
    dateModified: m.gewijzigd ? new Date(m.gewijzigd).toISOString() : undefined,
    keywords: [m.zoekwoorden.primair, ...(m.zoekwoorden.secundair ?? [])]
  }),
  // Een ItemList vertelt Google dat dit een samengestelde lijst recepten is.
  defineItemList({
    name: m.title,
    itemListElement: dagen.value
      .filter(d => d.recept)
      .map(d => ({ name: d.recept!.title, url: d.pad }))
  }),
  defineBreadcrumb({
    itemListElement: [
      { name: 'Home', item: '/' },
      { name: 'Weekmenu', item: '/weekmenu' },
      { name: m.title }
    ]
  })
])
</script>

<template>
  <UContainer class="py-8 lg:py-12">
    <UBreadcrumb
      :items="[{ label: 'Home', to: '/' }, { label: 'Weekmenu', to: '/weekmenu' }, { label: m.title }]"
      class="mb-6"
    />

    <header class="mx-auto max-w-3xl text-center">
      <p class="text-sm font-medium uppercase tracking-widest text-secondary">
        Week {{ m.week }} · {{ m.jaar }}
      </p>
      <h1 class="mt-3 text-3xl sm:text-4xl lg:text-5xl">
        {{ m.title }}
      </h1>
      <p class="mt-4 text-lg text-muted">
        {{ m.description }}
      </p>
    </header>

    <NuxtImg
      :src="m.afbeelding"
      :alt="m.afbeeldingAlt"
      width="1200"
      height="675"
      sizes="100vw md:768px lg:1024px"
      format="webp"
      preload
      class="mx-auto mt-8 aspect-video w-full max-w-4xl rounded-2xl object-cover"
    />

    <div class="prose dark:prose-invert mx-auto mt-10 max-w-3xl">
      <ContentRenderer :value="m" />
    </div>

    <section
      class="mx-auto mt-12 max-w-4xl"
      aria-labelledby="menu"
    >
      <h2
        id="menu"
        class="text-2xl"
      >
        Het menu van deze week
      </h2>

      <ol class="mt-6 space-y-4">
        <li
          v-for="dag in dagen"
          :key="dag.dag"
          class="flex flex-col gap-4 rounded-xl border border-default p-4 sm:flex-row sm:items-center"
        >
          <NuxtImg
            v-if="dag.recept"
            :src="dag.recept.afbeelding"
            :alt="dag.recept.afbeeldingAlt"
            width="160"
            height="120"
            format="webp"
            loading="lazy"
            class="h-24 w-full shrink-0 rounded-lg object-cover sm:w-40"
          />
          <div class="min-w-0">
            <p class="text-sm font-medium capitalize text-secondary">
              {{ dag.dag }}
            </p>
            <h3
              v-if="dag.recept"
              class="mt-0.5 text-lg"
            >
              <NuxtLink
                :to="dag.pad"
                class="hover:text-primary"
              >
                {{ dag.recept.title }}
              </NuxtLink>
            </h3>
            <p
              v-else
              class="mt-0.5 text-sm text-muted"
            >
              Recept nog niet gepubliceerd
            </p>
            <p
              v-if="dag.toelichting"
              class="mt-1 text-sm text-muted"
            >
              {{ dag.toelichting }}
            </p>
          </div>
        </li>
      </ol>
    </section>

    <div class="mx-auto mt-12 max-w-4xl">
      <ProductLijst
        :producten="producten"
        titel="Boodschappenlijst bij dit weekmenu"
      />
    </div>
  </UContainer>
</template>
