<script setup lang="ts" generic="T extends { path: string, title: string, description?: string, afbeelding: string, afbeeldingAlt: string }">
import type { ActiveFilter } from './ActiveFilters.vue'
// Imported rather than auto-imported: `is` resolves at compile time.
import MediaCard from './MediaCard.vue'
import MediaRow from './MediaRow.vue'

defineProps<{
  /** The current page of items. */
  items: T[]
  view: string
  total: number
  perPage: number
  filters: ActiveFilter[]
  noun: string
  plural: string
  emptyIcon: string
  emptyText: string
}>()

const emit = defineEmits<{ clear: [] }>()

const page = defineModel<number>('page', { required: true })

const top = ref<HTMLElement | null>(null)

// Page 2 would otherwise start halfway down the previous page.
function scrollToTop() {
  top.value?.scrollIntoView({ block: 'start', behavior: 'smooth' })
}
</script>

<template>
  <div ref="top">
    <ActiveFilters
      :filters="filters"
      :count="total"
      :noun="noun"
      :plural="plural"
      @clear-all="emit('clear')"
    />

    <!-- FLIP: Vue measures each card before and after and glides between.
         --i lets the CSS stagger them so you see the sorting happen. -->
    <TransitionGroup
      v-if="items.length"
      :key="view"
      name="flip"
      tag="div"
      :class="view === 'cards'
        ? 'flip-list flip-list-grid mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3'
        : 'flip-list mt-6 flex flex-col gap-2'"
    >
      <component
        :is="view === 'cards' ? MediaCard : MediaRow"
        v-for="(item, i) in items"
        :key="item.path"
        :to="item.path"
        :image="item.afbeelding"
        :alt="item.afbeeldingAlt"
        :title="item.title"
        :description="item.description"
        :priority="view === 'cards' && i < 3"
        :style="{ '--i': i }"
      >
        <template #meta>
          <slot
            name="meta"
            :item="item"
          />
        </template>
      </component>
    </TransitionGroup>

    <!-- Also shown on a single page: it keeps the bottom of the list
         predictable. -->
    <div
      v-if="total"
      class="mt-10 flex justify-center"
    >
      <UPagination
        v-model:page="page"
        :items-per-page="perPage"
        :total="total"
        @update:page="scrollToTop"
      />
    </div>

    <div
      v-else
      class="mt-16 text-center"
    >
      <UIcon
        :name="emptyIcon"
        class="size-8 text-dimmed"
      />
      <p class="mt-3 text-muted">
        {{ emptyText }}
      </p>
      <UButton
        v-if="filters.length"
        label="Wis filters"
        color="neutral"
        variant="outline"
        size="sm"
        class="mt-4"
        @click="emit('clear')"
      />
    </div>
  </div>
</template>
