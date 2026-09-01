<script setup lang="ts">
const site = useSiteConfig()
const jaar = new Date().getFullYear()

// The running week, so the footer points at something current instead of only
// at archive pages.
const { data: huidig } = await useAsyncData('footer:week', () =>
  queryCollection('weekmenus')
    .where('concept', '=', false)
    .order('gepubliceerd', 'DESC')
    .select('path', 'title', 'jaar', 'week')
    .limit(4)
    .all()
)

const today = useToday()

const dezeWeek = computed(() =>
  (huidig.value ?? []).find(m => weekContains(m.jaar, m.week, today.value))
)

const GANGEN = ['antipasto', 'primo', 'secondo', 'dolce']

const LINKS = [
  { label: 'Alle weekmenu\'s', to: '/weekmenu' },
  { label: 'Alle recepten', to: '/recepten' },
  { label: 'Over dit project', to: '/over' }
]
</script>

<template>
  <!-- Closes the page as the banner opens it, in the second colour. The
       scallop bites in the page colour, so the block above must stay light. -->
  <UFooter :ui="{ root: 'scallop-top print-hide bg-ceramic-500 pt-10 text-white' }">
    <template #top>
      <UContainer class="py-12">
        <!-- The promise in the display face, so the footer opens with the same
             voice as the banners rather than a link list. -->
        <p class="font-display max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
          Elke week een compleet Italiaans menu, met de boodschappenlijst erbij.
        </p>

        <div class="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div v-if="dezeWeek">
            <p class="font-display text-xs font-bold uppercase tracking-widest text-ceramic-200">
              Deze week
            </p>
            <p class="mt-3 text-sm">
              Week {{ dezeWeek.week }} · {{ weekPeriod(dezeWeek.jaar, dezeWeek.week) }}
            </p>
            <UButton
              :to="dezeWeek.path"
              color="neutral"
              size="sm"
              class="mt-3 bg-white text-ceramic-700 hover:bg-butter-200"
              trailing-icon="i-lucide-arrow-right"
              :label="`Naar ${dezeWeek.title}`"
            />
          </div>

          <nav aria-label="Site">
            <p class="font-display text-xs font-bold uppercase tracking-widest text-ceramic-200">
              Ontdekken
            </p>
            <ul class="mt-3 space-y-1.5 text-sm">
              <li
                v-for="link in LINKS"
                :key="link.to"
              >
                <NuxtLink
                  :to="link.to"
                  class="underline decoration-white/40 underline-offset-4 transition hover:decoration-white"
                >{{ link.label }}</NuxtLink>
              </li>
            </ul>
          </nav>

          <nav aria-label="Gangen">
            <p class="font-display text-xs font-bold uppercase tracking-widest text-ceramic-200">
              Per gang
            </p>
            <ul class="mt-3 space-y-1.5 text-sm">
              <li
                v-for="gang in GANGEN"
                :key="gang"
              >
                <NuxtLink
                  :to="`/recepten?gang=${gang}`"
                  class="capitalize underline decoration-white/40 underline-offset-4 transition hover:decoration-white"
                >{{ gang }}</NuxtLink>
              </li>
            </ul>
          </nav>

          <div>
            <p class="font-display text-xs font-bold uppercase tracking-widest text-ceramic-200">
              Ingrediënten
            </p>
            <p class="mt-3 text-sm">
              De Italiaanse producten uit onze recepten komen van Spesa da Antonio.
            </p>
            <UButton
              to="https://www.spesadaantonio.nl"
              target="_blank"
              rel="noopener"
              color="neutral"
              size="sm"
              class="mt-3 bg-white text-ceramic-700 hover:bg-butter-200"
              trailing-icon="i-lucide-arrow-up-right"
              label="Naar de winkel"
            />
          </div>
        </div>
      </UContainer>
    </template>

    <template #left>
      <p class="text-sm">
        © {{ jaar }} {{ site.name }}
      </p>
    </template>

    <template #right>
      <UButton
        to="/feed.xml"
        external
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-lucide-rss"
        label="RSS"
        class="text-white hover:bg-white/10"
      />
    </template>
  </UFooter>
</template>
