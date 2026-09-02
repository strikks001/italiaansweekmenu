<script setup lang="ts">
import type { CommandPaletteItem } from '@nuxt/ui'

type Recipe = { path: string, title: string, description: string, gang: string, termen: string }
type Menu = { path: string, title: string, description: string, jaar: number, week: number, thema: string }

const open = ref(false)
const term = ref('')
const today = useToday()

// Fetched on first open: nobody pays for the index until they search.
const { data: index, execute, status } = useLazyAsyncData(
  'zoekindex',
  () => $fetch<{ recepten: Recipe[], weekmenus: Menu[] }>('/zoekindex.json'),
  { immediate: false }
)

watch(open, (isOpen) => {
  if (isOpen) execute()
  else term.value = ''
})

defineShortcuts({ meta_k: () => (open.value = !open.value) })

function close() {
  open.value = false
}

const recipes = computed<CommandPaletteItem[]>(() =>
  (index.value?.recepten ?? []).map(r => ({
    label: r.title,
    description: r.description,
    suffix: r.gang,
    termen: r.termen,
    icon: 'i-lucide-utensils-crossed',
    to: r.path,
    onSelect: close
  }))
)

// Same rule as everywhere else: the running week and the archive, next week
// only from Friday. A menu that is not published yet must not surface here.
const menus = computed<CommandPaletteItem[]>(() =>
  (index.value?.weekmenus ?? [])
    .filter(m => menuVisibleOn(m.jaar, m.week, today.value))
    .map(m => ({
      label: m.title,
      description: m.thema,
      suffix: `Week ${m.week}`,
      icon: 'i-lucide-calendar-days',
      to: m.path,
      onSelect: close
    }))
)

const groups = computed(() => [
  { id: 'recepten', label: 'Recepten', items: recipes.value },
  { id: 'weekmenus', label: 'Weekmenu\'s', items: menus.value },
  ...(term.value
    ? [{
        id: 'archief',
        ignoreFilter: true,
        items: [{
          label: `Zoek "${term.value}" in het hele archief`,
          icon: 'i-lucide-search',
          to: { path: '/recepten', query: { q: term.value } },
          onSelect: close
        }]
      }]
    : [])
])
</script>

<template>
  <UButton
    icon="i-lucide-search"
    color="neutral"
    variant="ghost"
    size="lg"
    aria-label="Zoeken"
    @click="open = true"
  />

  <!-- title and description land in a visually hidden DialogTitle, so the
       dialog has a name without a header above the search field. -->
  <UModal
    v-model:open="open"
    title="Zoeken"
    description="Doorzoek alle recepten en weekmenu's"
    :ui="{ content: 'sm:max-w-2xl' }"
  >
    <template #content>
      <UCommandPalette
        v-model:search-term="term"
        :groups="groups"
        :loading="status === 'pending'"
        placeholder="Zoek op gerecht, ingrediënt of gang"
        :fuse="{ fuseOptions: { keys: ['label', 'description', 'suffix', 'termen'] } }"
        close
        class="h-96"
        @update:open="close"
      >
        <template #empty>
          <p class="text-sm text-muted">
            Niets gevonden voor "{{ term }}".
          </p>
        </template>
      </UCommandPalette>
    </template>
  </UModal>
</template>
