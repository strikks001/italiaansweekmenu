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
    <section class="affiche relative overflow-hidden bg-vermiljoen-500 text-white">
      <div
        class="dambord"
        aria-hidden="true"
      />

      <UContainer class="relative py-12 lg:py-20">
        <div class="mx-auto max-w-4xl">
          <h1 class="text-sm font-semibold uppercase tracking-[0.18em] opacity-90">
            Wat eten we vandaag?
          </h1>

          <template v-if="hoofdgerecht">
            <p class="mt-3 text-sm font-medium uppercase tracking-widest opacity-85">
              <template v-if="!isToday">
                Nog even wachten — het eerstvolgende is
              </template>
              <span>{{ featured!.weekday }}</span>
              {{ featured!.dayNumber }} {{ featured!.month }}
            </p>

            <div class="mt-6 grid items-center gap-8 sm:grid-cols-[1fr_auto] sm:gap-10">
              <div>
                <p
                  v-if="hoofdgerecht.recipe"
                  class="affiche-titel"
                >
                  <NuxtLink
                    :to="hoofdgerecht.path"
                    class="after:absolute after:inset-0"
                  >
                    {{ hoofdgerecht.recipe.title }}
                  </NuxtLink>
                </p>
                <p
                  v-else
                  class="affiche-titel opacity-60"
                >
                  Nog niet ingevuld
                </p>

                <p
                  v-if="hoofdgerecht.recipe"
                  class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium uppercase tracking-widest opacity-90"
                >
                  <span>{{ hoofdgerecht.recipe.gang }}</span>
                  <span aria-hidden="true">·</span>
                  <span>{{ readableDuration(hoofdgerecht.minutes) }}</span>
                </p>

                <p
                  v-if="hoofdgerecht.note"
                  class="mt-4 max-w-md text-lg leading-snug opacity-95"
                >
                  {{ hoofdgerecht.note }}
                </p>
              </div>

              <!-- Boog: de klassieke poortvorm, en meteen de rustigste manier om
                   een foto in een gekleurd vlak te zetten. -->
              <NuxtImg
                v-if="hoofdgerecht.recipe"
                :src="hoofdgerecht.recipe.afbeelding"
                :alt="hoofdgerecht.recipe.afbeeldingAlt"
                width="600"
                height="800"
                sizes="240px sm:280px"
                format="webp"
                preload
                class="boog mx-auto w-56 sm:w-64 lg:w-72"
              />
            </div>
          </template>

          <p
            v-else
            class="mt-4 max-w-xl text-lg opacity-90"
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

<style scoped>
/*
 * De affiche leunt op drie vormen uit de referentie: een schulprand als luifel,
 * een dambordhoek en een boog om de foto. Alle drie met CSS-verlopen, zodat er
 * geen extra afbeeldingen bij komen.
 */

/* Halve cirkels in de paginakleur happen uit de onderrand van het vlak. */
.affiche::after {
  content: "";
  position: absolute;
  inset-inline: 0;
  bottom: -1px;
  height: 1.75rem;
  background:
    radial-gradient(circle at 50% 100%, var(--ui-bg) 0.875rem, transparent 0.875rem)
    0 0 / 2.25rem 1.75rem repeat-x;
}

.dambord {
  position: absolute;
  top: 0;
  right: 0;
  width: 4.5rem;
  height: 4.5rem;
  background: repeating-conic-gradient(#12100f 0% 25%, #faf7f5 0% 50%) 0 0 / 1.125rem 1.125rem;
  /* Vervaagt naar de hoek, zodat het een accent blijft en geen tweede blikvanger. */
  mask-image: linear-gradient(215deg, #000 10%, transparent 70%);
}

@media (min-width: 640px) {
  .dambord {
    width: 9rem;
    height: 9rem;
    background-size: 1.625rem 1.625rem;
  }
}

.affiche-titel {
  margin-top: 0.5rem;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(2.75rem, 9vw, 5rem);
  line-height: 0.95;
  letter-spacing: -0.035em;
  text-wrap: balance;
}

.boog {
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border-radius: 999px 999px 0.75rem 0.75rem;
  border: 3px solid #faf7f5;
}
</style>
