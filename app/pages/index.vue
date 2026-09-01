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

// Filtered here, not per section, so nothing below can leak a menu that is
// not due yet.
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

// The first course carries the poster; the rest of that day sits below.
const mainCourse = computed(() => featured.value?.courses[0])
const otherCourses = computed(() => featured.value?.courses.slice(1) ?? [])

// Cards are lg:basis-1/3, so three fit from 1024px.
const { fits: fitsOnDesktop, breakpoints: carouselBreakpoints } = useCarouselFit(
  () => otherCourses.value.length,
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
    <!-- Poster: one vermilion field with today's dish as the draw. -->
    <!-- bg-vermilion-500 rather than bg-primary: Nuxt UI drops to shade 400
         in dark mode, and this field must keep one brand colour in both. -->
    <section class="scallop relative overflow-hidden bg-vermilion-500 pb-14 text-vermilion-950">
      <UContainer class="relative py-12 lg:py-20">
        <div class="mx-auto max-w-4xl">
          <h1 class="poster-question text-white">
            Wat eten we vandaag?
          </h1>

          <template v-if="mainCourse">
            <p class="mt-4 text-sm font-semibold uppercase tracking-widest">
              <template v-if="!isToday">
                Nog even wachten — het eerstvolgende is
              </template>
              <span>{{ featured!.weekday }}</span>
              {{ featured!.dayNumber }} {{ featured!.month }}
            </p>

            <!-- One panel: photo and text belong together, so they share a
                 frame. Loose elements on a colour field read as loose. -->
            <NuxtLink
              v-if="mainCourse.recipe"
              :to="mainCourse.path"
              class="tilt-resting group mt-8 grid overflow-hidden rounded-2xl border-b-4 border-b-ceramic-500 bg-default text-default sm:grid-cols-[minmax(0,16rem)_1fr]"
            >
              <NuxtImg
                :src="mainCourse.recipe.afbeelding"
                :alt="mainCourse.recipe.afbeeldingAlt"
                width="640"
                height="640"
                sizes="100vw sm:256px"
                format="webp"
                preload
                class="aspect-[4/3] size-full object-cover sm:aspect-auto"
              />

              <div class="flex flex-col justify-center gap-3 p-6 sm:p-8">
                <p class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-widest text-muted">
                  <span>{{ mainCourse.recipe.gang }}</span>
                  <span aria-hidden="true">·</span>
                  <span>{{ readableDuration(mainCourse.minutes) }}</span>
                </p>

                <h2 class="poster-dish">
                  {{ mainCourse.recipe.title }}
                </h2>

                <p
                  v-if="mainCourse.note"
                  class="text-muted"
                >
                  {{ mainCourse.note }}
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

    <UContainer v-if="otherCourses.length">
      <div class="mx-auto max-w-4xl pt-10">
        <h2 class="text-xl">
          Er komt die dag meer op tafel
        </h2>

        <UCarousel
          v-slot="{ item, index }"
          :items="otherCourses"
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
                <p>
                  <PillBadge>Deze week</PillBadge>
                </p>
                <h2 class="mt-2 text-3xl sm:text-4xl">
                  Wat eten we verder deze week?
                </h2>
                <p class="mt-2 text-muted">
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
                <p>
                  <PillBadge tone="ceramic">
                    Volgende week
                  </PillBadge>
                </p>
                <h2 class="mt-2 text-3xl sm:text-4xl">
                  Volgende week op het menu
                </h2>
                <p class="mt-2 text-muted">
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

    <section class="bg-butter-100 dark:bg-butter-950">
      <UContainer class="py-14 lg:py-20">
        <div class="mx-auto max-w-2xl text-center">
          <h2 class="text-3xl sm:text-4xl">
            Zoek je iets anders?
          </h2>
          <p class="mt-3 text-butter-900 dark:text-butter-200">
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
            <!-- Ceramic, not vermilion: white scores 11.94 on blue, 3.57 on red. -->
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

    <section>
      <UContainer class="py-14 text-center lg:py-20">
        <h2 class="text-3xl sm:text-4xl">
          De juiste ingrediënten maken het verschil
        </h2>
        <p class="mx-auto mt-4 max-w-xl text-muted">
          Echte Italiaanse pasta, olijfolie, kaas en salumi bestel je rechtstreeks
          bij Spesa da Antonio — geselecteerd bij kleine producenten in Italië.
        </p>
        <UButton
          to="https://www.spesadaantonio.nl"
          target="_blank"
          rel="noopener"
          color="secondary"
          size="lg"
          class="mt-7"
          trailing-icon="i-lucide-arrow-up-right"
        >
          Naar Spesa da Antonio
        </UButton>
      </UContainer>
    </section>
  </div>
</template>
