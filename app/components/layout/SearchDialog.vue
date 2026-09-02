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
    // Not `suffix`: that renders as grey text beside the title. The gang goes
    // into the pill, and into the search terms so it stays findable.
    badge: gangLabel(r.gang),
    badgeTone: 'butter',
    termen: `${r.termen} ${r.gang}`,
    icon: 'i-lucide-utensils-crossed',
    tint: 'butter',
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
      badge: `Week ${m.week}`,
      badgeTone: 'ceramic',
      termen: `week ${m.week} ${m.jaar}`,
      icon: 'i-lucide-calendar-days',
      tint: 'ceramic',
      to: m.path,
      onSelect: close
    }))
)

// Same tints as the contact cards, so a result reads as part of the family.
const TINTS: Record<string, string> = {
  butter: 'bg-butter-200 text-butter-900 dark:bg-butter-900 dark:text-butter-100',
  ceramic: 'bg-ceramic-200 text-ceramic-900 dark:bg-ceramic-900 dark:text-ceramic-100',
  peach: 'bg-peach-200 text-peach-900 dark:bg-peach-900 dark:text-peach-100'
}

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
          tint: 'peach',
          to: { path: '/recepten', query: { q: term.value } },
          onSelect: close
        }]
      }]
    : [])
])
</script>

<template>
  <!-- Ceramic, not vermilion: the bar already carries the red logo. Below sm
       the word gives way to the hamburger, the icon carries the meaning. -->
  <UButton
    icon="i-lucide-search"
    color="secondary"
    aria-label="Zoeken"
    @click="open = true"
  >
    <span class="hidden sm:inline">Zoeken</span>
  </UButton>

  <!-- title and description land in a visually hidden DialogTitle, so the
       band below can carry the question instead of a plain header. -->
  <UModal
    v-model:open="open"
    title="Zoeken"
    description="Doorzoek alle recepten en weekmenu's"
    :ui="{ content: 'sm:max-w-2xl rounded-2xl overflow-hidden border-b-4 border-b-ceramic-500' }"
  >
    <template #content>
      <!-- The house banner, in miniature. No scalloped edge: at this width
           the dots read as noise rather than as the house mark. -->
      <div class="bg-vermilion-500 px-6 pb-5 pt-5 text-vermilion-950">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 class="poster-dish text-white">
              Wat zoek je?
            </h2>
            <p class="mt-1 text-sm">
              Alle recepten en weekmenu's, in één keer doorzocht.
            </p>
          </div>

          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            aria-label="Sluiten"
            class="-me-2 -mt-1 text-vermilion-950 hover:bg-white/20"
            @click="close"
          />
        </div>
      </div>

      <UCommandPalette
        v-model:search-term="term"
        :groups="groups"
        :loading="status === 'pending'"
        placeholder="Zoek op gerecht, ingrediënt of gang"
        :fuse="{ fuseOptions: { keys: ['label', 'description', 'termen'] } }"
        class="h-96"
        :ui="{
          input: '[&_input]:h-14 [&_input]:text-base',
          label: 'text-xs font-bold uppercase tracking-widest text-muted',
          item: 'gap-3 rounded-xl px-3 py-2.5',
          itemLabelBase: 'font-semibold',
          empty: 'py-10'
        }"
      >
        <template #item-leading="{ item }">
          <span
            class="flex size-10 shrink-0 items-center justify-center rounded-xl"
            :class="TINTS[(item as { tint?: string }).tint ?? 'butter']"
          >
            <UIcon
              :name="item.icon!"
              class="size-5"
            />
          </span>
        </template>

        <template #item-trailing="{ item }">
          <PillBadge
            v-if="(item as { badge?: string }).badge"
            :tone="(item as { badgeTone?: 'butter' | 'ceramic' }).badgeTone ?? 'butter'"
          >
            {{ (item as { badge?: string }).badge }}
          </PillBadge>
        </template>

        <template #empty>
          <UIcon
            name="i-lucide-search-x"
            class="size-8 text-dimmed"
          />
          <p class="mt-3 font-semibold text-default">
            Niets gevonden voor "{{ term }}"
          </p>
          <p class="mt-1 text-sm">
            Probeer een gerecht, een ingrediënt of een gang.
          </p>
        </template>

        <template #footer>
          <div class="flex items-center justify-between gap-3 px-3 py-2 text-xs text-muted">
            <span class="flex items-center gap-1.5">
              <UKbd value="enter" />
              openen
              <UKbd value="esc" />
              sluiten
            </span>
            <NuxtLink
              to="/recepten"
              class="font-semibold text-ceramic-700 hover:underline dark:text-ceramic-300"
              @click="close"
            >
              Blader door alle recepten
            </NuxtLink>
          </div>
        </template>
      </UCommandPalette>
    </template>
  </UModal>
</template>
