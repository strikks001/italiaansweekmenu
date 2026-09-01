<script setup lang="ts">
const site = useSiteConfig()

const { data } = await useAsyncData('home', async () => {
  // Three weeks cover "today", "this week" and "next week"; the payload then
  // stays constant however large the archive grows.
  const latest = await queryCollection('weekmenus')
    .where('concept', '=', false)
    .order('gepubliceerd', 'DESC')
    .limit(3)
    .all()

  const menus = [...latest].reverse()
  const paths = [...new Set(menus.flatMap(m => m.recepten.map(r => r.pad)))]

  const recipes = paths.length
    ? await queryCollection('recepten').where('path', 'IN', paths).all()
    : []

  return { menus, recipes }
})

const today = useToday()

// Alleen wat vandaag getoond mag worden: de lopende week, en vanaf vrijdag de
// week erna. Filteren gebeurt hier, zodat geen enkele sectie eronder per
// ongeluk een menu toont dat nog niet aan de beurt is.
const weeks = computed(() =>
  (data.value?.menus ?? [])
    .filter(menu => menuVisibleOn(menu.jaar, menu.week, today.value))
    .map(menu => ({
      menu,
      days: groupByDay(menu, data.value?.recipes)
    }))
)

const currentWeek = computed(() =>
  weeks.value.find(w => w.days.some(d => d.dateISO >= today.value && d.courses.length))
  ?? weeks.value.at(-1)
)

const nextWeek = computed(() => {
  const i = weeks.value.findIndex(w => w === currentWeek.value)
  return i >= 0 ? weeks.value[i + 1] : undefined
})

// Today first. Only when a day has no dish yet do we fall forward, so the
// section is never empty while the archive is still filling up.
const featured = computed(() =>
  currentWeek.value?.days.find(d => d.dateISO >= today.value && d.courses.length)
)

const isToday = computed(() => featured.value?.dateISO === today.value)

// Het eerste gerecht draagt de affiche; wat er die dag nog meer op tafel komt
// staat eronder.
const hoofdgerecht = computed(() => featured.value?.courses[0])
const overigeGerechten = computed(() => featured.value?.courses.slice(1) ?? [])

// Cards are lg:basis-1/3, so three fit from 1024px.
const { fits: fitsOnDesktop, breakpoints: carouselBreakpoints } = useCarouselFit(
  () => overigeGerechten.value.length,
  3,
  1024
)

const restOfWeek = computed(() =>
  currentWeek.value?.days.filter(
    d => d.dateISO > (featured.value?.dateISO ?? '') && d.courses.length
  ) ?? []
)

// The archive already knows how to search; this is just the way in.
const query = ref('')

function search() {
  navigateTo({ path: '/recepten', query: query.value ? { q: query.value } : {} })
}

const title = 'Italiaans weekmenu — elke week een nieuw menu vol inspiratie'
const description = site.description

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })
defineOgImage('Default', { title: 'Italiaansweekmenu', description })
</script>

<template>
  <div>
    <!-- Affiche: één vlak vermiljoen met de schotel van vandaag als blikvanger.
         De schulprand onderaan is het luifelmotief uit de referentie. -->
    <!-- bg-vermiljoen-500 en niet bg-primary: Nuxt UI pakt in donkere modus tint
         400, en dit vlak hoort in beide modi dezelfde merkkleur te houden. -->
    <section class="schulp relative overflow-hidden bg-vermiljoen-500 pb-14 text-vermiljoen-950">
      <UContainer class="relative py-12 lg:py-20">
        <div class="mx-auto max-w-4xl">
          <h1 class="affiche-vraag text-white">
            Wat eten we vandaag?
          </h1>

          <template v-if="hoofdgerecht">
            <p class="mt-4 text-sm font-semibold uppercase tracking-widest">
              <template v-if="!isToday">
                Nog even wachten — het eerstvolgende is
              </template>
              <span>{{ featured!.weekday }}</span>
              {{ featured!.dayNumber }} {{ featured!.month }}
            </p>

            <!-- Het recept als één paneel op het vlak: foto en tekst horen bij
                 elkaar, dus zitten ze in hetzelfde kader. Losse elementen op een
                 gekleurd vlak lezen als losse elementen. -->
            <NuxtLink
              v-if="hoofdgerecht.recipe"
              :to="hoofdgerecht.path"
              class="tilt-rust group mt-8 grid overflow-hidden rounded-2xl border-b-4 border-b-keramiek-500 bg-default text-default sm:grid-cols-[minmax(0,16rem)_1fr]"
            >
              <NuxtImg
                :src="hoofdgerecht.recipe.afbeelding"
                :alt="hoofdgerecht.recipe.afbeeldingAlt"
                width="640"
                height="640"
                sizes="100vw sm:256px"
                format="webp"
                preload
                class="aspect-[4/3] size-full object-cover sm:aspect-auto"
              />

              <div class="flex flex-col justify-center gap-3 p-6 sm:p-8">
                <p class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-widest text-muted">
                  <span>{{ hoofdgerecht.recipe.gang }}</span>
                  <span aria-hidden="true">·</span>
                  <span>{{ readableDuration(hoofdgerecht.minutes) }}</span>
                </p>

                <h2 class="affiche-gerecht">
                  {{ hoofdgerecht.recipe.title }}
                </h2>

                <p
                  v-if="hoofdgerecht.note"
                  class="text-muted"
                >
                  {{ hoofdgerecht.note }}
                </p>

                <span class="mt-1 flex items-center gap-1.5 text-sm font-semibold text-secondary">
                  Naar het recept
                  <UIcon
                    name="i-lucide-arrow-right"
                    class="size-4 transition group-hover:translate-x-0.5"
                  />
                </span>
              </div>
            </NuxtLink>

            <p
              v-else
              class="mt-8 text-lg"
            >
              Voor deze dag staat nog geen recept klaar.
            </p>
          </template>

          <p
            v-else
            class="mt-4 max-w-xl text-lg"
          >
            Het menu van deze week verschijnt binnenkort.
          </p>
        </div>
      </UContainer>
    </section>

    <UContainer v-if="overigeGerechten.length">
      <div class="mx-auto max-w-4xl pt-10">
        <h2 class="text-xl">
          Er komt die dag meer op tafel
        </h2>

        <UCarousel
          v-slot="{ item, index }"
          :items="overigeGerechten"
          arrows
          :breakpoints="carouselBreakpoints"
          :ui="{
            viewport: '-m-4 p-4',
            container: 'items-stretch',
            item: 'basis-[86%] sm:basis-1/2 lg:basis-1/3',
            prev: fitsOnDesktop ? 'lg:hidden' : '',
            next: fitsOnDesktop ? 'lg:hidden' : ''
          }"
          class="mt-5"
        >
          <CourseCard
            :course="item"
            :priority="index === 0"
          />
        </UCarousel>
      </div>
    </UContainer>

    <section>
      <UContainer class="py-12 lg:py-16">
        <div class="mx-auto flex max-w-4xl flex-col gap-12">
          <section v-if="restOfWeek.length">
            <div class="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 class="text-2xl sm:text-3xl">
                  Wat eten we verder deze week?
                </h2>
                <p class="mt-1 text-muted">
                  Kies een dag om het recept te openen.
                </p>
              </div>
              <UButton
                v-if="currentWeek"
                :to="currentWeek.menu.path"
                color="neutral"
                variant="ghost"
                trailing-icon="i-lucide-arrow-right"
              >
                Hele weekmenu
              </UButton>
            </div>

            <WeekAgenda
              :days="restOfWeek"
              class="mt-6"
            />
          </section>

          <section v-if="nextWeek">
            <div class="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 class="text-2xl sm:text-3xl">
                  Volgende week op het menu
                </h2>
                <p class="mt-1 text-muted">
                  {{ nextWeek.menu.thema }} — alvast om vooruit te plannen.
                </p>
              </div>
              <UButton
                :to="nextWeek.menu.path"
                color="neutral"
                variant="ghost"
                trailing-icon="i-lucide-arrow-right"
              >
                Week {{ nextWeek.menu.week }}
              </UButton>
            </div>

            <WeekAgenda
              :days="nextWeek.days.filter(d => d.courses.length)"
              class="mt-6"
            />
          </section>
        </div>
      </UContainer>
    </section>

    <section class="border-t border-default">
      <UContainer class="py-12 lg:py-16">
        <div class="mx-auto max-w-2xl text-center">
          <h2 class="text-2xl sm:text-3xl">
            Zoek je iets anders?
          </h2>
          <p class="mt-2 text-muted">
            Doorzoek het hele archief op gerecht, gang of ingrediënt.
          </p>

          <form
            class="mt-6 flex flex-col gap-2 sm:flex-row"
            @submit.prevent="search"
          >
            <UInput
              v-model="query"
              type="search"
              placeholder="Bijvoorbeeld: pasta, risotto, dolce"
              icon="i-lucide-search"
              size="lg"
              class="flex-1"
            />
            <!-- Keramiek en niet vermiljoen: wit op blauw haalt 11,94, op rood 3,57. -->
            <UButton
              type="submit"
              label="Zoeken"
              color="secondary"
              size="lg"
            />
          </form>
        </div>
      </UContainer>
    </section>

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
