<script setup lang="ts">
const site = useSiteConfig()

// Twee losse queries in één useAsyncData: scheelt een netwerkronde en het
// resultaat wordt bij `nuxt generate` mee ingebakken in de HTML.
const { data } = await useAsyncData('home', async () => {
  const [menu, recepten] = await Promise.all([
    queryCollection('weekmenus').where('concept', '=', false).order('gepubliceerd', 'DESC').first(),
    queryCollection('recepten').where('concept', '=', false).order('gepubliceerd', 'DESC').limit(6).all()
  ])
  return { menu, recepten }
})

const menu = computed(() => data.value?.menu)
const recepten = computed(() => data.value?.recepten ?? [])

const titel = 'Italiaans weekmenu — elke week een nieuw menu vol inspiratie'
const omschrijving = site.description

useSeoMeta({ title: titel, description: omschrijving, ogTitle: titel, ogDescription: omschrijving })
defineOgImage('Standaard', { title: 'Italiaansweekmenu', description: omschrijving })

// WebSite + Organization horen op de homepage. Google gebruikt dit om je merk
// te herkennen en eventueel een sitelinks-zoekbalk te tonen.
useSchemaOrg([
  defineWebSite({ name: site.name, description: site.description, inLanguage: 'nl-NL' }),
  defineOrganization({ name: 'Italiaansweekmenu', url: site.url })
])
</script>

<template>
  <div>
    <!-- ------------------------------------------------------ hero: deze week -->
    <section class="border-b border-default bg-elevated/40">
      <UContainer class="py-12 lg:py-20">
        <div
          v-if="menu"
          class="grid items-center gap-10 lg:grid-cols-2"
        >
          <div>
            <p class="text-sm font-medium uppercase tracking-widest text-secondary">
              Week {{ menu.week }} · Het menu van deze week
            </p>
            <h1 class="mt-3 text-4xl leading-tight lg:text-5xl">
              {{ menu.title }}
            </h1>
            <p class="mt-4 text-lg text-muted">
              {{ menu.description }}
            </p>
            <div class="mt-8 flex flex-wrap gap-3">
              <UButton
                :to="menu.path"
                size="lg"
                trailing-icon="i-lucide-arrow-right"
              >
                Bekijk het weekmenu
              </UButton>
              <UButton
                to="/recepten"
                size="lg"
                color="neutral"
                variant="outline"
              >
                Alle recepten
              </UButton>
            </div>
          </div>

          <NuxtImg
            :src="menu.afbeelding"
            :alt="menu.afbeeldingAlt"
            width="800"
            height="600"
            sizes="100vw lg:600px"
            format="webp"
            preload
            class="aspect-[4/3] w-full rounded-2xl object-cover shadow-lg"
          />
        </div>

        <div
          v-else
          class="mx-auto max-w-2xl text-center"
        >
          <h1 class="text-4xl lg:text-5xl">
            Elke week een nieuw Italiaans menu
          </h1>
          <p class="mt-4 text-lg text-muted">
            {{ omschrijving }}
          </p>
        </div>
      </UContainer>
    </section>

    <!-- ----------------------------------------------------- laatste recepten -->
    <UContainer class="py-12 lg:py-16">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 class="text-2xl sm:text-3xl">
            Nieuwste recepten
          </h2>
          <p class="mt-2 text-muted">
            Authentieke Italiaanse gerechten, stap voor stap uitgelegd.
          </p>
        </div>
        <UButton
          to="/recepten"
          color="neutral"
          variant="ghost"
          trailing-icon="i-lucide-arrow-right"
        >
          Alles bekijken
        </UButton>
      </div>

      <div
        v-if="recepten.length"
        class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <ReceptKaart
          v-for="(recept, i) in recepten"
          :key="recept.path"
          :recept="recept"
          :prioriteit="i < 3"
        />
      </div>
      <p
        v-else
        class="mt-10 text-muted"
      >
        De eerste recepten verschijnen binnenkort.
      </p>
    </UContainer>

    <!-- ------------------------------------------------------------ shop-CTA -->
    <section class="border-t border-default bg-elevated/40">
      <UContainer class="py-12 text-center lg:py-16">
        <h2 class="text-2xl sm:text-3xl">
          De juiste ingrediënten maken het verschil
        </h2>
        <p class="mx-auto mt-3 max-w-xl text-muted">
          Echte Italiaanse pasta, olijfolie, kaas en salumi bestel je rechtstreeks
          bij Spesa da Antonio — geselecteerd bij kleine producenten in Italië.
        </p>
        <UButton
          to="https://www.spesadaantonio.nl"
          target="_blank"
          rel="noopener"
          color="secondary"
          size="lg"
          class="mt-6"
          trailing-icon="i-lucide-arrow-up-right"
        >
          Naar Spesa da Antonio
        </UButton>
      </UContainer>
    </section>
  </div>
</template>
