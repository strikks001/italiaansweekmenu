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

const weeks = computed(() =>
  (data.value?.menus ?? []).map(menu => ({
    menu,
    days: groupByDay(menu, data.value?.recipes)
  }))
)

const today = useToday()

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

// Cards are lg:basis-1/3, so three fit from 1024px.
const { fits: fitsOnDesktop, breakpoints: carouselBreakpoints } = useCarouselFit(
  () => featured.value?.courses.length ?? 0,
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

useSchemaOrg([
  defineWebSite({ name: site.name, description: site.description, inLanguage: 'nl-NL' }),
  defineOrganization({ name: 'Italiaansweekmenu', url: site.url })
])
</script>

<template>
  <div>
    <section class="border-b border-default bg-elevated/40">
      <UContainer class="py-10 lg:py-14">
        <div class="mx-auto max-w-4xl">
          <h1 class="text-3xl sm:text-4xl">
            Wat eten we vandaag?
          </h1>

          <template v-if="featured">
            <p class="mt-2 text-muted">
              <template v-if="!isToday">
                Vandaag staat er niets gepland. Het eerstvolgende is
              </template>
              <span :class="isToday ? 'capitalize' : ''">{{ featured.weekday }}</span>
              {{ featured.dayNumber }} {{ featured.month }}
              <template v-if="featured.courses.length > 1">
                · {{ featured.courses.length }} gangen
              </template>
            </p>

            <!-- Several courses: a carousel, because stacked cards push the
                 rest of the page too far down. Embla stays active until all
                 cards fit, otherwise a tablet cannot reach the third one. -->
            <UCarousel
              v-if="featured.courses.length > 1"
              v-slot="{ item, index }"
              :items="featured.courses"
              arrows
              :breakpoints="carouselBreakpoints"
              :ui="{
                // The viewport clips with overflow-hidden, which cut off the
                // cards' hover shadow. Padding gives it room inside the clip;
                // the negative margin keeps the layout where it was.
                viewport: '-m-4 p-4',
                // Stretch, so a card with a longer title stays as tall as the rest.
                container: 'items-stretch',
                // Just under full width on mobile: the sliver of the next card
                // is what tells you there is more than one.
                item: 'basis-[86%] sm:basis-1/2 lg:basis-1/3',
                prev: fitsOnDesktop ? 'lg:hidden' : '',
                next: fitsOnDesktop ? 'lg:hidden' : ''
              }"
              class="mt-6"
            >
              <CourseCard
                :course="item"
                :priority="index === 0"
              />
            </UCarousel>

            <div
              v-else
              class="mt-6"
            >
              <CourseCard
                :course="featured.courses[0]!"
                wide
                priority
              />
            </div>
          </template>

          <p
            v-else
            class="mt-3 max-w-xl text-muted"
          >
            Het menu van deze week verschijnt binnenkort.
          </p>
        </div>
      </UContainer>
    </section>

    <UContainer class="py-10 lg:py-14">
      <div class="mx-auto flex max-w-3xl flex-col gap-12">
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
            <UButton
              type="submit"
              label="Zoeken"
              color="primary"
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
