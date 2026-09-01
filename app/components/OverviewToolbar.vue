<script setup lang="ts">
import type { FilterOption } from './FilterGroup.vue'

defineProps<{
  sortOptions: FilterOption[]
  /** Number of active filters, shown on the mobile filter button. */
  filterCount: number
  /** Omit to hide the search field (week menus browse by date, not by text). */
  searchPlaceholder?: string
  /** Optional heading on the left, e.g. "Andere weken". */
  heading?: string
}>()

const emit = defineEmits<{ openFilters: [] }>()

const search = defineModel<string>('search', { default: '' })
const sort = defineModel<string>('sort', { required: true })
const view = defineModel<string>('view', { required: true })
</script>

<template>
  <!-- Sticks right under the site header: --ui-header-height is the height
       Nuxt UI uses for it. z-30 stays below the header's z-50. -->
  <div class="sticky top-(--ui-header-height) z-30 border-y-2 border-default bg-default/90 backdrop-blur">
    <UContainer class="flex flex-col gap-3 py-3 sm:flex-row sm:items-center">
      <h2
        v-if="heading"
        class="text-lg font-semibold sm:flex-1"
      >
        {{ heading }}
      </h2>

      <UInput
        v-if="searchPlaceholder"
        v-model="search"
        type="search"
        :placeholder="searchPlaceholder"
        icon="i-lucide-search"
        size="lg"
        class="flex-1"
        :ui="{ trailing: 'pe-1' }"
      >
        <template
          v-if="search"
          #trailing
        >
          <UButton
            color="neutral"
            variant="link"
            icon="i-lucide-x"
            aria-label="Zoekterm wissen"
            @click="search = ''"
          />
        </template>
      </UInput>

      <div class="flex gap-2 sm:gap-3">
        <!-- No room for a sidebar on mobile, so filters open in a slideover.
             The count makes an active filter visible when collapsed. -->
        <UButton
          icon="i-lucide-sliders-horizontal"
          size="lg"
          color="neutral"
          variant="outline"
          class="lg:hidden"
          @click="emit('openFilters')"
        >
          Filters
          <UBadge
            v-if="filterCount"
            :label="String(filterCount)"
            color="secondary"
            size="sm"
          />
        </UButton>

        <USelect
          v-model="sort"
          :items="sortOptions"
          value-key="value"
          size="lg"
          icon="i-lucide-arrow-up-down"
          class="flex-1 sm:w-56 sm:flex-none"
          aria-label="Sorteervolgorde"
        />

        <div
          class="flex gap-2"
          role="group"
          aria-label="Weergave"
        >
          <UButton
            icon="i-lucide-layout-grid"
            size="lg"
            :color="view === 'cards' ? 'primary' : 'neutral'"
            :variant="view === 'cards' ? 'solid' : 'outline'"
            aria-label="Kaartweergave"
            :aria-pressed="view === 'cards'"
            @click="view = 'cards'"
          />
          <UButton
            icon="i-lucide-list"
            size="lg"
            :color="view === 'list' ? 'primary' : 'neutral'"
            :variant="view === 'list' ? 'solid' : 'outline'"
            aria-label="Lijstweergave"
            :aria-pressed="view === 'list'"
            @click="view = 'list'"
          />
        </div>
      </div>
    </UContainer>
  </div>
</template>
