<script setup lang="ts">
const route = useRoute()
const router = useRouter()

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

const COURSES = [
  { value: 'alle', label: 'Alles' },
  { value: 'antipasto', label: 'Antipasto' },
  { value: 'primo', label: 'Primo' },
  { value: 'secondo', label: 'Secondo' },
  { value: 'contorno', label: 'Contorno' },
  { value: 'dolce', label: 'Dolce' }
]

const DIETS = [
  { value: 'vegetarisch', label: 'Vegetarisch' },
  { value: 'veganistisch', label: 'Veganistisch' },
  { value: 'glutenvrij', label: 'Glutenvrij' },
  { value: 'lactosevrij', label: 'Lactosevrij' }
]

/** Total time buckets. The matcher lives here so counts and filter agree. */
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

// Filters live in the URL so a filtered list can be shared and the back button
// keeps working. The view mode does not: it is a preference, not content.
const search = ref(String(route.query.q ?? ''))
const sort = ref(String(route.query.sorteer ?? 'nieuwste'))
const selection = ref<Record<string, string | string[]>>({
  course: String(route.query.gang ?? 'alle'),
  diet: String(route.query.dieet ?? '').split(',').filter(Boolean),
  time: String(route.query.tijd ?? '').split(',').filter(Boolean),
  level: String(route.query.niveau ?? '').split(',').filter(Boolean)
})
const view = useViewMode()
const filtersOpen = ref(false)

const PER_PAGE = 12

const course = computed(() => selection.value.course as string)
const diet = computed(() => selection.value.diet as string[])
const time = computed(() => selection.value.time as string[])
const level = computed(() => selection.value.level as string[])

/** Prep plus cooking time, the number every time filter works on. */
function totalMinutes(r: { voorbereidingstijd: number, bereidingstijd: number }) {
  return r.voorbereidingstijd + r.bereidingstijd
}

/** Lowercase without accents, so "ragu" also finds "Ragù". */
function normalise(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

interface Criteria {
  search: string
  course: string
  diet: string[]
  time: string[]
  level: string[]
}

const criteria = computed<Criteria>(() => ({
  search: search.value,
  course: course.value,
  diet: diet.value,
  time: time.value,
  level: level.value
}))

type Recipe = NonNullable<typeof recipes.value>[number]

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

  const sorted = [...list]
  if (sort.value === 'snelste') {
    sorted.sort((a, b) => totalMinutes(a) - totalMinutes(b))
  } else if (sort.value === 'titel') {
    sorted.sort((a, b) => a.title.localeCompare(b.title, 'nl'))
  }
  return sorted
})

/**
 * Facet counts: how many results a option would give, judged against the other
 * active filters but ignoring its own group. Otherwise the numbers keep showing
 * the whole archive while the list is already filtered down.
 */
function facetCounts(
  ignore: Partial<Criteria>,
  options: { value: string }[],
  test: (r: Recipe, value: string) => boolean
): Record<string, number> {
  const base = (recipes.value ?? []).filter(r => matches(r, { ...criteria.value, ...ignore }))
  const counts: Record<string, number> = { alle: base.length }
  for (const option of options) {
    counts[option.value] = base.filter(r => test(r, option.value)).length
  }
  return counts
}

const { page, paged } = usePagination(visible, PER_PAGE)

const results = ref<HTMLElement | null>(null)

/** Jump back to the top of the list, otherwise page 2 starts mid-scroll. */
function scrollToResults() {
  results.value?.scrollIntoView({ block: 'start', behavior: 'smooth' })
}

// A new filter or search should start at the first page again.
watch([search, course, diet, time, level, sort], () => {
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
  search.value = String(q.q ?? '')
  sort.value = String(q.sorteer ?? 'nieuwste')
  selection.value = {
    course: String(q.gang ?? 'alle'),
    diet: String(q.dieet ?? '').split(',').filter(Boolean),
    time: String(q.tijd ?? '').split(',').filter(Boolean),
    level: String(q.niveau ?? '').split(',').filter(Boolean)
  }
  page.value = Math.max(1, Number(q.pagina) || 1)
  hydrated.value = true
})

watchEffect(() => {
  if (!hydrated.value) return
  router.replace({
    query: {
      ...(search.value ? { q: search.value } : {}),
      ...(course.value !== 'alle' ? { gang: course.value } : {}),
      ...(diet.value.length ? { dieet: diet.value.join(',') } : {}),
      ...(time.value.length ? { tijd: time.value.join(',') } : {}),
      ...(level.value.length ? { niveau: level.value.join(',') } : {}),
      ...(sort.value !== 'nieuwste' ? { sorteer: sort.value } : {}),
      ...(page.value > 1 ? { pagina: String(page.value) } : {})
    }
  })
})

const countByCourse = computed(() =>
  facetCounts({ course: 'alle' }, COURSES, (r, v) => v === 'alle' || r.gang === v)
)

const countByTime = computed(() =>
  facetCounts({ time: [] }, TIMES, (r, v) => Boolean(TIMES.find(t => t.value === v)?.match(totalMinutes(r))))
)

const countByLevel = computed(() =>
  facetCounts({ level: [] }, LEVELS, (r, v) => (r.moeilijkheid ?? 'makkelijk') === v)
)

const countByDiet = computed(() =>
  facetCounts({ diet: [] }, DIETS, (r, v) => (r.dieet ?? []).includes(v as never))
)

const filterGroups = computed(() => [
  { key: 'course', title: 'Gang', options: COURSES, counts: countByCourse.value },
  { key: 'time', title: 'Bereidingstijd', options: TIMES, counts: countByTime.value, multiple: true },
  { key: 'level', title: 'Niveau', options: LEVELS, counts: countByLevel.value, multiple: true },
  { key: 'diet', title: 'Dieet', options: DIETS, counts: countByDiet.value, multiple: true }
])

const activeFilters = computed(() => {
  const chips: { id: string, label: string, clear: () => void }[] = []
  if (search.value) {
    chips.push({
      id: 'search',
      label: `"${search.value}"`,
      clear: () => { search.value = '' }
    })
  }
  if (course.value !== 'alle') {
    chips.push({
      id: `course-${course.value}`,
      label: COURSES.find(c => c.value === course.value)?.label ?? course.value,
      clear: () => { selection.value.course = 'alle' }
    })
  }
  for (const d of diet.value) {
    chips.push({
      id: `diet-${d}`,
      label: DIETS.find(o => o.value === d)?.label ?? d,
      clear: () => { selection.value.diet = diet.value.filter(x => x !== d) }
    })
  }
  for (const t of time.value) {
    chips.push({
      id: `time-${t}`,
      label: TIMES.find(o => o.value === t)?.label ?? t,
      clear: () => { selection.value.time = time.value.filter(x => x !== t) }
    })
  }
  for (const l of level.value) {
    chips.push({
      id: `level-${l}`,
      label: LEVELS.find(o => o.value === l)?.label ?? l,
      clear: () => { selection.value.level = level.value.filter(x => x !== l) }
    })
  }
  return chips
})

function clearFilters() {
  search.value = ''
  sort.value = 'nieuwste'
  selection.value = { course: 'alle', diet: [], time: [], level: [] }
}

const title = 'Alle Italiaanse recepten'
const description = 'Blader door ons complete archief met authentieke Italiaanse recepten, van antipasto tot dolce. Zoek op gerecht, ingrediënt of gang.'

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })
defineOgImage('Default', { title, description })

useSchemaOrg([
  defineBreadcrumb({ itemListElement: [{ name: 'Home', item: '/' }, { name: 'Recepten' }] })
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
    </UContainer>

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
            :label="`Toon ${visible.length} ${visible.length === 1 ? 'recept' : 'recepten'}`"
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
        <!-- Not sticky: with four groups the lower filters would scroll out of
             reach behind the pinned toolbar. -->
        <aside class="hidden lg:block">
          <FilterPanel
            v-model="selection"
            :groups="filterGroups"
          />
        </aside>

        <div ref="results">
          <ActiveFilters
            :filters="activeFilters"
            :count="visible.length"
            noun="recept"
            plural="recepten"
            @clear-all="clearFilters"
          />

          <!-- FLIP: Vue measures each card before and after and glides between.
               --i lets the CSS stagger them so you see the sorting happen. -->
          <TransitionGroup
            v-if="paged.length && view === 'cards'"
            :key="view"
            name="flip"
            tag="div"
            class="flip-list flip-list-grid mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
          >
            <MediaCard
              v-for="(recipe, i) in paged"
              :key="recipe.path"
              :to="recipe.path"
              :image="recipe.afbeelding"
              :alt="recipe.afbeeldingAlt"
              :title="recipe.title"
              :description="recipe.description"
              :priority="i < 3"
              :style="{ '--i': i }"
            >
              <template #meta>
                <UBadge
                  :label="recipe.gang"
                  color="primary"
                  variant="subtle"
                  size="sm"
                  class="capitalize"
                />
                <span>{{ readableDuration(recipe.voorbereidingstijd + recipe.bereidingstijd) }}</span>
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
              v-for="(recipe, i) in paged"
              :key="recipe.path"
              :to="recipe.path"
              :image="recipe.afbeelding"
              :alt="recipe.afbeeldingAlt"
              :title="recipe.title"
              :description="recipe.description"
              :style="{ '--i': i }"
            >
              <template #meta>
                <UBadge
                  :label="recipe.gang"
                  color="primary"
                  variant="subtle"
                  size="sm"
                  class="capitalize"
                />
                <span>{{ readableDuration(recipe.voorbereidingstijd + recipe.bereidingstijd) }}</span>
              </template>
            </MediaRow>
          </TransitionGroup>

          <!-- Always visible while there are results, also on a single
               page: it keeps the bottom of the list predictable. -->
          <div
            v-if="visible.length"
            class="mt-10 flex justify-center"
          >
            <UPagination
              v-model:page="page"
              :items-per-page="PER_PAGE"
              :total="visible.length"
              @update:page="scrollToResults"
            />
          </div>

          <div
            v-if="!paged.length"
            class="mt-16 text-center"
          >
            <UIcon
              name="i-lucide-search-x"
              class="size-8 text-dimmed"
            />
            <p class="mt-3 text-muted">
              Geen recepten gevonden voor
              <template v-if="search">
                <strong class="text-default">{{ search }}</strong>
              </template>
              <template v-else>
                deze combinatie
              </template>.
            </p>
            <UButton
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
