<script setup lang="ts">
const site = useSiteConfig()
const { footer } = useAppConfig()
const jaar = new Date().getFullYear()

// The running week, so the footer points at something current rather than only
// at archive pages.
const { data: weken } = await useAsyncData('footer:week', () =>
  queryCollection('weekmenus')
    .where('concept', '=', false)
    .order('gepubliceerd', 'DESC')
    .select('path', 'jaar', 'week')
    .limit(4)
    .all()
)

const today = useToday()

const dezeWeek = computed(() =>
  (weken.value ?? []).find(m => weekContains(m.jaar, m.week, today.value))
)

const GANGEN = ['antipasto', 'primo', 'secondo', 'dolce']

const LINKS = [
  { label: 'Alle weekmenu\'s', to: '/weekmenu' },
  { label: 'Alle recepten', to: '/recepten' },
  { label: 'Over dit project', to: '/over' }
]

const linkKlasse = 'underline decoration-white/40 underline-offset-4 transition hover:decoration-white'
</script>

<template>
  <!-- Closes the page as the banner opens it, in the second colour. The
       scallop bites in the page colour, so the block above must stay light. -->
  <UFooter :ui="{ root: 'scallop-top print-hide bg-ceramic-500 pt-8 text-white' }">
    <template #top>
      <UContainer class="py-10">
        <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <p class="font-display text-2xl font-extrabold leading-tight tracking-tight">
              Elke week een compleet Italiaans menu
            </p>
            <p class="mt-3 max-w-xs text-sm text-ceramic-100">
              Met de boodschappenlijst erbij, zodat je alleen nog hoeft te koken.
            </p>

            <div
              v-if="dezeWeek"
              class="mt-5"
            >
              <p class="font-display text-xs font-bold uppercase tracking-widest text-ceramic-200">
                Deze week
              </p>
              <UButton
                :to="dezeWeek.path"
                color="neutral"
                size="sm"
                class="mt-2 bg-white text-ceramic-700 hover:bg-butter-200"
                trailing-icon="i-lucide-arrow-right"
                :label="`Week ${dezeWeek.week} · ${weekPeriod(dezeWeek.jaar, dezeWeek.week)}`"
              />
            </div>
          </div>

          <nav aria-label="Site">
            <p class="font-display text-xs font-bold uppercase tracking-widest text-ceramic-200">
              Ontdekken
            </p>
            <ul class="mt-3 space-y-2 text-sm">
              <li
                v-for="link in LINKS"
                :key="link.to"
              >
                <NuxtLink
                  :to="link.to"
                  :class="linkKlasse"
                >{{ link.label }}</NuxtLink>
              </li>
            </ul>
          </nav>

          <nav aria-label="Gangen">
            <p class="font-display text-xs font-bold uppercase tracking-widest text-ceramic-200">
              Per gang
            </p>
            <ul class="mt-3 space-y-2 text-sm">
              <li
                v-for="gang in GANGEN"
                :key="gang"
              >
                <NuxtLink
                  :to="`/recepten?gang=${gang}`"
                  class="capitalize"
                  :class="linkKlasse"
                >{{ gang }}</NuxtLink>
              </li>
            </ul>
          </nav>
        </div>
      </UContainer>
    </template>

    <template #left>
      <p class="text-sm text-ceramic-100">
        © {{ jaar }} {{ footer.bedrijf.naam || site.name }}
        <template v-if="footer.bedrijf.kvk">
          · KvK {{ footer.bedrijf.kvk }}
        </template>
      </p>
    </template>

    <template #right>
      <div class="flex flex-wrap items-center gap-1">
        <UButton
          v-for="kanaal in footer.social"
          :key="kanaal.label"
          :to="kanaal.to"
          target="_blank"
          rel="noopener"
          :icon="kanaal.icon"
          :aria-label="kanaal.label"
          color="neutral"
          variant="ghost"
          size="sm"
          class="text-white hover:bg-white/10"
        />
        <UButton
          v-if="footer.bedrijf.email"
          :to="`mailto:${footer.bedrijf.email}`"
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-lucide-mail"
          :label="footer.bedrijf.email"
          class="text-white hover:bg-white/10"
        />
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
      </div>
    </template>
  </UFooter>
</template>
