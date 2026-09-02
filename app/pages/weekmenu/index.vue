<script setup lang="ts">
import type { ActiveFilter } from '~/components/overview/ActiveFilters.vue'

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

const PER_PAGE = 12

const today = useToday()

// The running week plus the archive; the next one only from Friday.
const visible = computed(() =>
  (menus.value ?? []).filter(m => menuVisibleOn(m.jaar, m.week, today.value))
)

const current = computed(() =>
  visible.value.find(m => weekContains(m.jaar, m.week, today.value))
)

const sort = ref('nieuwste')
const selection = ref<Record<string, string | string[]>>({ year: 'alle', season: [] })
const view = useViewMode()
const filtersOpen = ref(false)

const year = computed(() => selection.value.year as string)
const season = computed(() => selection.value.season as string[])

// The highlighted week already sits on top; this is everything else.
const rest = computed(() => {
  let list = visible.value.filter(m => m !== current.value)

  if (year.value !== 'alle') list = list.filter(m => String(m.jaar) === year.value)
  if (season.value.length) list = list.filter(m => season.value.includes(seasonOfWeek(m.jaar, m.week)))

  return [...list].sort((a, b) => sort.value === 'oudste'
    ? (a.jaar - b.jaar) || (a.week - b.week)
    : (b.jaar - a.jaar) || (b.week - a.week))
})

const counts = computed(() => {
  const base = visible.value.filter(m => m !== current.value)
  const byYear: Record<string, number> = { alle: base.length }
  const bySeason: Record<string, number> = {}
  for (const m of base) {
    byYear[String(m.jaar)] = (byYear[String(m.jaar)] ?? 0) + 1
    const s = seasonOfWeek(m.jaar, m.week)
    bySeason[s] = (bySeason[s] ?? 0) + 1
  }
  return { byYear, bySeason }
})

const filterGroups = computed(() => [
  {
    key: 'year',
    title: 'Jaar',
    counts: counts.value.byYear,
    options: [
      { value: 'alle', label: 'Alle jaren' },
      ...[...new Set(visible.value.map(m => m.jaar))]
        .sort((a, b) => b - a)
        .map(y => ({ value: String(y), label: String(y) }))
    ]
  },
  {
    key: 'season',
    title: 'Seizoen',
    multiple: true,
    counts: counts.value.bySeason,
    options: SEASONS.map(s => ({ value: s, label: SEASON_LABELS[s]! }))
  }
])

const activeFilters = computed<ActiveFilter[]>(() => {
  const chips: ActiveFilter[] = []
  if (year.value !== 'alle') {
    chips.push({
      id: 'year',
      label: year.value,
      clear: () => {
        selection.value.year = 'alle'
      }
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

const { page, paged } = usePagination(rest, PER_PAGE)

watch([year, season, sort], () => {
  page.value = 1
})

useQuerySync(
  (q) => {
    sort.value = q.sorteer || 'nieuwste'
    selection.value = {
      year: q.jaar || 'alle',
      season: (q.seizoen ?? '').split(',').filter(Boolean)
    }
    page.value = Math.max(1, Number(q.pagina) || 1)
  },
  () => ({
    ...(year.value !== 'alle' ? { jaar: year.value } : {}),
    ...(season.value.length ? { seizoen: season.value.join(',') } : {}),
    ...(sort.value !== 'nieuwste' ? { sorteer: sort.value } : {}),
    ...(page.value > 1 ? { pagina: String(page.value) } : {})
  })
)

const title = 'Alle Italiaanse weekmenu\'s'
const description = 'Elke week stellen we een compleet Italiaans weekmenu samen. Blader door het archief voor inspiratie voor elke dag van de week.'

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })
defineOgImage('Default', { title, description })

useSchemaOrg([
  // CollectionPage tells Google this is an archive, not a single article.
  defineWebPage({ '@type': 'CollectionPage', 'name': title, 'description': description }),
  defineBreadcrumb({ itemListElement: [{ name: 'Home', item: '/' }, { name: 'Weekmenu' }] })
])
</script>

<template>
  <div>
    <PageBanner
      breed
      :breadcrumb="[{ label: 'Home', to: '/' }, { label: 'Weekmenu' }]"
    >
      <h1 class="text-4xl text-white sm:text-5xl">
        {{ title }}
      </h1>
      <p class="mx-auto mt-4 max-w-2xl text-lg">
        {{ description }}
      </p>

      <!-- Same treatment as the homepage hero: one panel on the field,
           tilted at rest. -->
      <NuxtLink
        v-if="current"
        :to="current.path"
        class="tilt-resting group mt-10 grid overflow-hidden rounded-2xl border-b-4 border-b-ceramic-500 bg-default text-left text-default sm:grid-cols-[minmax(0,16rem)_1fr]"
      >
        <NuxtImg
          :src="current.afbeelding"
          :alt="current.afbeeldingAlt"
          width="640"
          height="640"
          sizes="100vw sm:256px"
          format="webp"
          preload
          class="aspect-[4/3] size-full object-cover sm:aspect-auto"
        />

        <div class="flex flex-col justify-center gap-3 p-6 sm:p-8">
          <!-- "This week" as a flag, not an aside: it is the reason this card
               stands apart. -->
          <p class="flex flex-wrap items-center gap-x-3 gap-y-2">
            <PillBadge tone="vermilion">Deze week</PillBadge>
            <span class="text-xs font-semibold uppercase tracking-widest text-muted">
              Week {{ current.week }} · {{ weekPeriod(current.jaar, current.week) }}
            </span>
          </p>

          <h2 class="poster-dish">
            {{ current.title }}
          </h2>

          <p class="text-muted">
            {{ current.description }}
          </p>

          <span class="mt-1 flex items-center gap-1.5 text-sm font-semibold text-secondary">
            Bekijk het weekmenu
            <UIcon
              name="i-lucide-arrow-right"
              class="size-4 transition group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </NuxtLink>
    </PageBanner>

    <OverviewToolbar
      v-model:sort="sort"
      v-model:view="view"
      :sort-options="SORTS"
      :filter-count="activeFilters.length"
      :heading="current ? 'Andere weken' : `Alle weekmenu's`"
      class="mt-12"
      @open-filters="filtersOpen = true"
    />

    <UContainer class="pb-12 lg:pb-16">
      <div class="mt-6 grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <OverviewFilters
          v-model="selection"
          v-model:open="filtersOpen"
          :groups="filterGroups"
          :count="rest.length"
          :has-filters="activeFilters.length > 0"
          noun="weekmenu"
          plural="weekmenu's"
          @clear="clearFilters"
        />

        <OverviewResults
          v-model:page="page"
          :items="paged"
          :view="view"
          :total="rest.length"
          :per-page="PER_PAGE"
          :filters="activeFilters"
          noun="weekmenu"
          plural="weekmenu's"
          empty-icon="i-lucide-calendar-x"
          empty-text="Geen weekmenu's gevonden voor deze combinatie."
          @clear="clearFilters"
        >
          <template #meta="{ item }">
            <span class="font-medium uppercase tracking-widest">
              Week {{ item.week }} · {{ item.jaar }}
            </span>
          </template>
        </OverviewResults>
      </div>
    </UContainer>
  </div>
</template>
