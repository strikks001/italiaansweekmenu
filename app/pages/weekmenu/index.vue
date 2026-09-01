<script setup lang="ts">
import type { ActiveFilter } from '~/components/ActiveFilters.vue'

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

// De lopende week en het archief; de week erna pas vanaf vrijdag.
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
  // CollectionPage zegt Google dat dit een archief is, geen los artikel.
  defineWebPage({ '@type': 'CollectionPage', 'name': title, 'description': description }),
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
