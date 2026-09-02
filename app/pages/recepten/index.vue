<script setup lang="ts">
import type { ActiveFilter } from '~/components/overview/ActiveFilters.vue'

// .select() fetches only what the cards and filters need; without it every
// recipe travels with its ingredients and steps in the payload.
const { data: recipes } = await useAsyncData('recipes:all', () =>
  queryCollection('recepten')
    .where('concept', '=', false)
    .order('gepubliceerd', 'DESC')
    .select(
      'path', 'title', 'description', 'afbeelding', 'afbeeldingAlt',
      'gang', 'dieet', 'moeilijkheid', 'gepubliceerd',
      'voorbereidingstijd', 'bereidingstijd', 'zoekwoorden'
    )
    .all()
)

type Recipe = NonNullable<typeof recipes.value>[number]
type Criteria = { search: string, course: string, diet: string[], time: string[], level: string[] }

// Built from the course list, so a new course cannot be forgotten here.
// `basis` is left out: those are building blocks, not something to browse.
const COURSES = [
  { value: 'alle', label: 'Alles' },
  ...GANGEN.filter(g => g !== 'basis').map(g => ({
    value: g,
    label: gangLabel(g).replace(/^./, c => c.toUpperCase())
  }))
]

const DIETS = [
  { value: 'vegetarisch', label: 'Vegetarisch' },
  { value: 'veganistisch', label: 'Veganistisch' },
  { value: 'glutenvrij', label: 'Glutenvrij' },
  { value: 'lactosevrij', label: 'Lactosevrij' }
]

/** The matcher lives with the option, so counts and filter cannot disagree. */
const TIMES = [
  { value: 'kort', label: 'Tot 30 min', match: (m: number) => m <= 30 },
  { value: 'middel', label: '30 tot 60 min', match: (m: number) => m > 30 && m <= 60 },
  { value: 'lang', label: 'Meer dan een uur', match: (m: number) => m > 60 }
]

const LEVELS = [
  { value: 'makkelijk', label: 'Makkelijk' },
  { value: 'gemiddeld', label: 'Gemiddeld' },
  { value: 'uitdagend', label: 'Uitdagend' }
]

const SORTS = [
  { value: 'nieuwste', label: 'Nieuwste eerst' },
  { value: 'snelste', label: 'Kortste kooktijd' },
  { value: 'titel', label: 'Alfabetisch' }
]

const PER_PAGE = 12

const search = ref('')
const sort = ref('nieuwste')
const selection = ref<Record<string, string | string[]>>({
  course: 'alle', diet: [], time: [], level: []
})
const view = useViewMode()
const filtersOpen = ref(false)

const course = computed(() => selection.value.course as string)
const diet = computed(() => selection.value.diet as string[])
const time = computed(() => selection.value.time as string[])
const level = computed(() => selection.value.level as string[])

const totalMinutes = (r: Recipe) => r.voorbereidingstijd + r.bereidingstijd

/** Lowercase without accents, so "ragu" also finds "Ragù". */
const normalise = (text: string) =>
  text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

const criteria = computed<Criteria>(() => ({
  search: search.value,
  course: course.value,
  diet: diet.value,
  time: time.value,
  level: level.value
}))

/** Single source of truth: both the list and the facet counts run through this. */
function matches(r: Recipe, c: Criteria): boolean {
  if (c.course !== 'alle' && r.gang !== c.course) return false
  if (c.level.length && !c.level.includes(r.moeilijkheid ?? 'makkelijk')) return false
  if (c.diet.length && !c.diet.every(d => (r.dieet ?? []).includes(d as never))) return false
  // Any selected time bucket may match, unlike diet where all must.
  if (c.time.length && !c.time.some(v => TIMES.find(t => t.value === v)?.match(totalMinutes(r)))) return false

  const term = normalise(c.search.trim())
  if (!term) return true

  const haystack = normalise([
    r.title, r.description, r.gang,
    ...(r.dieet ?? []),
    r.zoekwoorden?.primair ?? '',
    ...(r.zoekwoorden?.secundair ?? [])
  ].join(' '))
  // Every word must appear somewhere, so "snelle pasta" works too.
  return term.split(/\s+/).every(word => haystack.includes(word))
}

const visible = computed(() => {
  const list = (recipes.value ?? []).filter(r => matches(r, criteria.value))
  if (sort.value === 'snelste') return [...list].sort((a, b) => totalMinutes(a) - totalMinutes(b))
  if (sort.value === 'titel') return [...list].sort((a, b) => a.title.localeCompare(b.title, 'nl'))
  return list
})

/**
 * How many results an option would give, judged against the other active
 * filters but ignoring its own group. Otherwise the numbers keep showing the
 * whole archive while the list is already filtered down.
 */
function facetCounts(
  ignore: Partial<Criteria>,
  options: { value: string }[],
  test: (r: Recipe, value: string) => boolean
): Record<string, number> {
  const base = (recipes.value ?? []).filter(r => matches(r, { ...criteria.value, ...ignore }))
  const counts: Record<string, number> = { alle: base.length }
  for (const option of options) counts[option.value] = base.filter(r => test(r, option.value)).length
  return counts
}

const filterGroups = computed(() => [
  {
    key: 'course',
    title: 'Gang',
    options: COURSES,
    counts: facetCounts({ course: 'alle' }, COURSES, (r, v) => v === 'alle' || r.gang === v)
  },
  {
    key: 'time',
    title: 'Bereidingstijd',
    options: TIMES,
    multiple: true,
    counts: facetCounts({ time: [] }, TIMES, (r, v) => Boolean(TIMES.find(t => t.value === v)?.match(totalMinutes(r))))
  },
  {
    key: 'level',
    title: 'Niveau',
    options: LEVELS,
    multiple: true,
    counts: facetCounts({ level: [] }, LEVELS, (r, v) => (r.moeilijkheid ?? 'makkelijk') === v)
  },
  {
    key: 'diet',
    title: 'Dieet',
    options: DIETS,
    multiple: true,
    counts: facetCounts({ diet: [] }, DIETS, (r, v) => (r.dieet ?? []).includes(v as never))
  }
])

const activeFilters = computed<ActiveFilter[]>(() => {
  const chips: ActiveFilter[] = []
  const labelOf = (options: readonly { value: string, label: string }[], v: string) =>
    options.find(o => o.value === v)?.label ?? v

  if (search.value) {
    chips.push({
      id: 'search',
      label: `"${search.value}"`,
      clear: () => {
        search.value = ''
      }
    })
  }
  if (course.value !== 'alle') {
    chips.push({
      id: `course-${course.value}`,
      label: labelOf(COURSES, course.value),
      clear: () => { selection.value.course = 'alle' }
    })
  }

  const multi = [
    { key: 'diet', values: diet.value, options: DIETS },
    { key: 'time', values: time.value, options: TIMES },
    { key: 'level', values: level.value, options: LEVELS }
  ]
  for (const group of multi) {
    for (const v of group.values) {
      chips.push({
        id: `${group.key}-${v}`,
        label: labelOf(group.options, v),
        clear: () => { selection.value[group.key] = group.values.filter(x => x !== v) }
      })
    }
  }
  return chips
})

function clearFilters() {
  search.value = ''
  sort.value = 'nieuwste'
  selection.value = { course: 'alle', diet: [], time: [], level: [] }
}

const { page, paged } = usePagination(visible, PER_PAGE)

watch([search, course, diet, time, level, sort], () => {
  page.value = 1
})

useQuerySync(
  (q) => {
    search.value = q.q ?? ''
    sort.value = q.sorteer || 'nieuwste'
    selection.value = {
      course: q.gang || 'alle',
      diet: (q.dieet ?? '').split(',').filter(Boolean),
      time: (q.tijd ?? '').split(',').filter(Boolean),
      level: (q.niveau ?? '').split(',').filter(Boolean)
    }
    page.value = Math.max(1, Number(q.pagina) || 1)
  },
  () => ({
    ...(search.value ? { q: search.value } : {}),
    ...(course.value !== 'alle' ? { gang: course.value } : {}),
    ...(diet.value.length ? { dieet: diet.value.join(',') } : {}),
    ...(time.value.length ? { tijd: time.value.join(',') } : {}),
    ...(level.value.length ? { niveau: level.value.join(',') } : {}),
    ...(sort.value !== 'nieuwste' ? { sorteer: sort.value } : {}),
    ...(page.value > 1 ? { pagina: String(page.value) } : {})
  })
)

const title = 'Alle Italiaanse recepten'
const description = 'Blader door ons complete archief met authentieke Italiaanse recepten, van antipasto tot dolce. Zoek op gerecht, ingrediënt of gang.'

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })
defineOgImage('Default', { title, description })

useSchemaOrg([
  // CollectionPage tells Google this is an archive, not a single article.
  defineWebPage({ '@type': 'CollectionPage', 'name': title, 'description': description }),
  defineBreadcrumb({ itemListElement: [{ name: 'Home', item: '/' }, { name: 'Recepten' }] })
])
</script>

<template>
  <div>
    <PageBanner :breadcrumb="[{ label: 'Home', to: '/' }, { label: 'Recepten' }]">
      <h1 class="text-4xl text-white sm:text-5xl">
        {{ title }}
      </h1>
      <p class="mt-4 text-lg">
        {{ description }}
      </p>
    </PageBanner>

    <OverviewToolbar
      v-model:search="search"
      v-model:sort="sort"
      v-model:view="view"
      :sort-options="SORTS"
      :filter-count="activeFilters.length"
      search-placeholder="Zoek op gerecht of ingrediënt"
      class="mt-8"
      @open-filters="filtersOpen = true"
    />

    <UContainer class="pb-12 lg:pb-16">
      <div class="mt-6 grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <OverviewFilters
          v-model="selection"
          v-model:open="filtersOpen"
          :groups="filterGroups"
          :count="visible.length"
          :has-filters="activeFilters.length > 0"
          noun="recept"
          plural="recepten"
          @clear="clearFilters"
        />

        <OverviewResults
          v-model:page="page"
          :items="paged"
          :view="view"
          :total="visible.length"
          :per-page="PER_PAGE"
          :filters="activeFilters"
          noun="recept"
          plural="recepten"
          empty-icon="i-lucide-search-x"
          :empty-text="search
            ? `Geen recepten gevonden voor ${search}.`
            : 'Geen recepten gevonden voor deze combinatie.'"
          @clear="clearFilters"
        >
          <template #meta="{ item }">
            <PillBadge>{{ gangLabel(item.gang) }}</PillBadge>
            <span>{{ readableDuration(item.voorbereidingstijd + item.bereidingstijd) }}</span>
          </template>
        </OverviewResults>
      </div>
    </UContainer>
  </div>
</template>
