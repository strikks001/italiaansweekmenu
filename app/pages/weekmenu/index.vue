<script setup lang="ts">
const { data: menus } = await useAsyncData('weekmenus:alle', () =>
  queryCollection('weekmenus')
    .where('concept', '=', false)
    .order('gepubliceerd', 'DESC')
    .all()
)

const titel = 'Alle Italiaanse weekmenu\'s'
const omschrijving = 'Elke week stellen we een compleet Italiaans weekmenu samen. Blader door het archief voor inspiratie voor elke dag van de week.'

useSeoMeta({ title: titel, description: omschrijving, ogTitle: titel, ogDescription: omschrijving })
defineOgImage('Standaard', { title: titel, description: omschrijving })

useSchemaOrg([
  defineBreadcrumb({ itemListElement: [{ name: 'Home', item: '/' }, { name: 'Weekmenu' }] })
])
</script>

<template>
  <UContainer class="py-8 lg:py-12">
    <header class="mx-auto max-w-2xl text-center">
      <h1 class="text-3xl sm:text-4xl">
        {{ titel }}
      </h1>
      <p class="mt-4 text-muted">
        {{ omschrijving }}
      </p>
    </header>

    <div
      v-if="menus?.length"
      class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      <article
        v-for="(menu, i) in menus"
        :key="menu.path"
        class="group relative overflow-hidden rounded-xl border border-default bg-default transition hover:border-primary/40"
      >
        <NuxtImg
          :src="menu.afbeelding"
          :alt="menu.afbeeldingAlt"
          width="600"
          height="400"
          sizes="sm:100vw md:50vw lg:33vw"
          format="webp"
          :loading="i < 3 ? 'eager' : 'lazy'"
          class="aspect-[3/2] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
        <div class="p-4">
          <p class="text-xs font-medium uppercase tracking-widest text-secondary">
            Week {{ menu.week }} · {{ menu.jaar }}
          </p>
          <h2 class="mt-1.5 text-lg leading-snug">
            <NuxtLink
              :to="menu.path"
              class="after:absolute after:inset-0"
            >
              {{ menu.title }}
            </NuxtLink>
          </h2>
          <p class="mt-1 line-clamp-2 text-sm text-muted">
            {{ menu.description }}
          </p>
        </div>
      </article>
    </div>

    <p
      v-else
      class="mt-16 text-center text-muted"
    >
      Het eerste weekmenu verschijnt binnenkort.
    </p>
  </UContainer>
</template>
