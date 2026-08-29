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

/*
 * "Today" on a statically generated site: nuxt generate renders this page once,
 * so the date freezes at build time. We correct after hydration, which keeps
 * the first render identical to the server (no mismatch) and still shows the
 * right day on a day-old build. A daily rebuild keeps the HTML Google sees
 * correct too.
 */
const today = ref(todayISO())
onMounted(() => {
  const now = todayISO()
  if (now !== today.value) today.value = now
})

const currentWeek = computed(() =>
  weeks.value.find(w => w.days.some(d => d.dateISO >= today.value && d.courses.length))
  ?? weeks.value.at(-1)
)

const nextWeek = computed(() => {
  const i = weeks.value.findIndex(w => w === currentWeek.value)
  return i >= 0 ? weeks.value[i + 1] : undefined
})

// Today if it is on the menu, otherwise the next filled day, so the section is
// never empty.
const featured = computed(() =>
  currentWeek.value?.days.find(d => d.dateISO >= today.value && d.courses.length)
)

const isToday = computed(() => featured.value?.dateISO === today.value)

const heading = computed(() =>
  isToday.value
    ? 'Wat eten we vandaag?'
    : `Wat eten we ${featured.value?.weekday ?? 'deze week'}?`
)

// Cards are lg:basis-1/3, so three fit from 1024px. Only then may Embla stop;
// with more courses it stays swipeable.
const fitsOnDesktop = computed(() => (featured.value?.courses.length ?? 0) <= 3)
const carouselBreakpoints = computed(() => ({
  '(min-width: 1024px)': { active: !fitsOnDesktop.value }
}))

const restOfWeek = computed(() =>
  currentWeek.value?.days.filter(
    d => d.dateISO > (featured.value?.dateISO ?? '') && d.courses.length
  ) ?? []
)

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
            {{ heading }}
          </h1>

          <template v-if="featured">
            <p class="mt-2 text-muted">
              <span class="capitalize">{{ featured.weekday }}</span>
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
              dots
              :breakpoints="carouselBreakpoints"
              :ui="{
                // The viewport clips with overflow-hidden, which cut off the
                // cards' hover shadow. Padding gives it room inside the clip;
                // the negative margin keeps the layout where it was.
                viewport: '-m-4 p-4',
                item: 'basis-full sm:basis-1/2 lg:basis-1/3',
                dots: fitsOnDesktop ? 'lg:hidden' : ''
              }"
              class="mt-6 pb-10"
              :class="fitsOnDesktop ? 'lg:pb-0' : ''"
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
