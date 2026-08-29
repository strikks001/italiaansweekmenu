<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const { data: menus } = await useAsyncData('weekmenus:all', () =>
  queryCollection('weekmenus')
    .where('concept', '=', false)
    .order('gepubliceerd', 'DESC')
    .select('path', 'title', 'description', 'afbeelding', 'afbeeldingAlt', 'jaar', 'week', 'thema')
    .all()
)

const SEASON_LABELS: Record<string, string> = {
  winter: 'Winter', lente: 'Lente', zomer: 'Zomer', herfst: 'Herfst'
}

const SORTS = [
  { value: 'nieuwste', label: 'Nieuwste eerst' },
  { value: 'oudste', label: 'Oudste eerst' }
]

// Frozen at build time on a static site, corrected after hydration.
const today = ref(todayISO())
onMounted(() => {
  const now = todayISO()
  if (now !== today.value) today.value = now
})

const current = computed(() =>
  menus.value?.find(m => weekContains(m.jaar, m.week, today.value))
)

const sort = ref(String(route.query.sorteer ?? 'nieuwste'))
const selection = ref<Record<string, string | string[]>>({
  year: String(route.query.jaar ?? 'alle'),
  season: String(route.query.seizoen ?? '').split(',').filter(Boolean)
})
const view = useViewMode()
const filtersOpen = ref(false)

const PER_PAGE = 12

const year = computed(() => selection.value.year as string)
const season = computed(() => selection.value.season as string[])

// The highlighted week already sits on top; this is everything else.
const rest = computed(() => {
  let list = (menus.value ?? []).filter(m => m !== current.value)

  if (year.value !== 'alle') list = list.filter(m => String(m.jaar) === year.value)
  if (season.value.length) {
    list = list.filter(m => season.value.includes(seasonOfWeek(m.jaar, m.week)))
  }

  return [...list].sort((a, b) => sort.value === 'oudste'
    ? (a.jaar - b.jaar) || (a.week - b.week)
    : (b.jaar - a.jaar) || (b.week - a.week))
})

const { page, paged } = usePagination(rest, PER_PAGE)

const results = ref<HTMLElement | null>(null)

/** Jump back to the top of the list, otherwise page 2 starts mid-scroll. */
function scrollToResults() {
  results.value?.scrollIntoView({ block: 'start', behavior: 'smooth' })
}

// A new filter should start at the first page again.
watch([year, season, sort], () => {
  page.value = 1
})

/*
 * A statically generated page hydrates with the server's route, whose query is
 * empty. Reading the filters during setup would therefore miss them, and the
 * sync below would immediately rewrite the URL without them - a shared link
 * with filters lost its filters. So: re-read once the client router has the
 * real URL, and only start writing after that.
 */
const hydrated = ref(false)

onMounted(() => {
  const q = route.query
  sort.value = String(q.sorteer ?? 'nieuwste')
  selection.value = {
    year: String(q.jaar ?? 'alle'),
    season: String(q.seizoen ?? '').split(',').filter(Boolean)
  }
  page.value = Math.max(1, Number(q.pagina) || 1)
  hydrated.value = true
})

watchEffect(() => {
  if (!hydrated.value) return
  router.replace({
    query: {
      ...(year.value !== 'alle' ? { jaar: year.value } : {}),
      ...(season.value.length ? { seizoen: season.value.join(',') } : {}),
      ...(sort.value !== 'nieuwste' ? { sorteer: sort.value } : {}),
      ...(page.value > 1 ? { pagina: String(page.value) } : {})
    }
  })
})

const counts = computed(() => {
  const base = (menus.value ?? []).filter(m => m !== current.value)
  const byYear: Record<string, number> = { alle: base.length }
  const bySeason: Record<string, number> = {}
  for (const m of base) {
    byYear[String(m.jaar)] = (byYear[String(m.jaar)] ?? 0) + 1
    const s = seasonOfWeek(m.jaar, m.week)
    bySeason[s] = (bySeason[s] ?? 0) + 1
  }
  return { byYear, bySeason }
})

const yearOptions = computed(() => [
  { value: 'alle', label: 'Alle jaren' },
  ...[...new Set((menus.value ?? []).map(m => m.jaar))]
    .sort((a, b) => b - a)
    .map(y => ({ value: String(y), label: String(y) }))
])

const filterGroups = computed(() => [
  { key: 'year', title: 'Jaar', options: yearOptions.value, counts: counts.value.byYear },
  {
    key: 'season',
    title: 'Seizoen',
    options: SEASONS.map(s => ({ value: s, label: SEASON_LABELS[s]! })),
    counts: counts.value.bySeason,
    multiple: true
  }
])

const activeFilters = computed(() => {
  const chips: { id: string, label: string, clear: () => void }[] = []
  if (year.value !== 'alle') {
    chips.push({
      id: 'year',
      label: year.value,
      clear: () => { selection.value.year = 'alle' }
    })
  }
  for (const s of season.value) {
    chips.push({
      id: `season-${s}`,
      label: SEASON_LABELS[s] ?? s,
      clear: () => { selection.value.season = season.value.filter(x => x !== s) }
    })
  }
  return chips
})

function clearFilters() {
  sort.value = 'nieuwste'
  selection.value = { year: 'alle', season: [] }
}

const title = 'Alle Italiaanse weekmenu\'s'
const description = 'Elke week stellen we een compleet Italiaans weekmenu samen. Blader door het archief voor inspiratie voor elke dag van de week.'

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })
defineOgImage('Default', { title, description })

useSchemaOrg([
  defineBreadcrumb({ itemListElement: [{ name: 'Home', item: '/' }, { name: 'Weekmenu' }] })
])
</script>

<template>
  <div>
    <UContainer class="pt-8 lg:pt-12">
      <header class="mx-auto max-w-2xl text-center">
        <h1 class="text-3xl sm:text-4xl">
          {{ title }}
        </h1>
        <p class="mt-4 text-muted">
          {{ description }}
        </p>
      </header>

      <!-- This week, pulled out of the grid so it reads as the current menu. -->
      <article
        v-if="current"
        class="group relative mx-auto mt-10 max-w-5xl overflow-hidden rounded-2xl border-2 border-primary bg-default shadow-lg transition hover:shadow-xl sm:flex sm:items-stretch"
      >
        <NuxtImg
          :src="current.afbeelding"
          :alt="current.afbeeldingAlt"
          width="800"
          height="600"
          sizes="100vw sm:440px"
          format="webp"
          preload
          class="aspect-[4/3] w-full object-cover sm:aspect-auto sm:w-2/5 sm:shrink-0"
        />

        <div class="flex flex-col justify-center gap-3 p-6 sm:p-8">
          <div class="flex flex-wrap items-center gap-2">
            <UBadge
              label="Deze week"
              color="primary"
              variant="solid"
              size="sm"
            />
            <span class="text-xs font-medium uppercase tracking-widest text-muted">
              Week {{ current.week }} · {{ weekPeriod(current.jaar, current.week) }}
            </span>
          </div>

          <h2 class="text-2xl leading-tight sm:text-3xl">
            <NuxtLink
              :to="current.path"
              class="after:absolute after:inset-0 group-hover:text-primary"
            >
              {{ current.title }}
            </NuxtLink>
          </h2>

          <p class="text-muted">
            {{ current.description }}
          </p>

          <span class="mt-1 flex items-center gap-1 text-sm font-medium text-primary">
            Bekijk het weekmenu
            <UIcon
              name="i-lucide-arrow-right"
              class="size-4 transition group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </article>
    </UContainer>

    <OverviewToolbar
      v-model:sort="sort"
      v-model:view="view"
      :sort-options="SORTS"
      :filter-count="activeFilters.length"
      :heading="current ? 'Andere weken' : `Alle weekmenu's`"
      class="mt-12"
      @open-filters="filtersOpen = true"
    />

    <USlideover
      v-model:open="filtersOpen"
      title="Filters"
      side="left"
    >
      <template #body>
        <FilterPanel
          v-model="selection"
          :groups="filterGroups"
        />
      </template>
      <template #footer>
        <div class="flex w-full gap-2">
          <UButton
            v-if="activeFilters.length"
            label="Wis filters"
            color="neutral"
            variant="outline"
            block
            class="flex-1"
            @click="clearFilters"
          />
          <UButton
            :label="`Toon ${rest.length} ${rest.length === 1 ? 'weekmenu' : `weekmenu's`}`"
            color="primary"
            block
            class="flex-1"
            @click="filtersOpen = false"
          />
        </div>
      </template>
    </USlideover>

    <UContainer class="pb-12 lg:pb-16">
      <div class="mt-6 grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <aside class="hidden lg:block">
          <FilterPanel
            v-model="selection"
            :groups="filterGroups"
          />
        </aside>

        <div ref="results">
          <ActiveFilters
            :filters="activeFilters"
            :count="rest.length"
            noun="weekmenu"
            plural="weekmenu's"
            @clear-all="clearFilters"
          />

          <TransitionGroup
            v-if="paged.length && view === 'cards'"
            :key="view"
            name="flip"
            tag="div"
            class="flip-list flip-list-grid mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
          >
            <MediaCard
              v-for="(menu, i) in paged"
              :key="menu.path"
              :to="menu.path"
              :image="menu.afbeelding"
              :alt="menu.afbeeldingAlt"
              :title="menu.title"
              :description="menu.description"
              :priority="i < 3"
              :style="{ '--i': i }"
            >
              <template #meta>
                <span class="font-medium uppercase tracking-widest">
                  Week {{ menu.week }} · {{ menu.jaar }}
                </span>
              </template>
            </MediaCard>
          </TransitionGroup>

          <TransitionGroup
            v-else-if="paged.length"
            :key="view"
            name="flip"
            tag="div"
            class="flip-list mt-6 flex flex-col gap-2"
          >
            <MediaRow
              v-for="(menu, i) in paged"
              :key="menu.path"
              :to="menu.path"
              :image="menu.afbeelding"
              :alt="menu.afbeeldingAlt"
              :title="menu.title"
              :description="menu.description"
              :style="{ '--i': i }"
            >
              <template #meta>
                <span class="font-medium uppercase tracking-widest">
                  Week {{ menu.week }} · {{ menu.jaar }}
                </span>
              </template>
            </MediaRow>
          </TransitionGroup>

          <!-- Always visible while there are results, also on a single
               page: it keeps the bottom of the list predictable. -->
          <div
            v-if="rest.length"
            class="mt-10 flex justify-center"
          >
            <UPagination
              v-model:page="page"
              :items-per-page="PER_PAGE"
              :total="rest.length"
              @update:page="scrollToResults"
            />
          </div>

          <div
            v-if="!paged.length"
            class="mt-16 text-center"
          >
            <UIcon
              name="i-lucide-calendar-x"
              class="size-8 text-dimmed"
            />
            <p class="mt-3 text-muted">
              Geen weekmenu's gevonden voor deze combinatie.
            </p>
            <UButton
              v-if="activeFilters.length"
              label="Wis filters"
              color="neutral"
              variant="outline"
              size="sm"
              class="mt-4"
              @click="clearFilters"
            />
          </div>
        </div>
      </div>
    </UContainer>
  </div>
</template>
