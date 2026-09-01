<script setup lang="ts">
export interface ActiveFilter {
  id: string
  label: string
  clear: () => void
}

defineProps<{
  filters: ActiveFilter[]
  count: number
  /** Singular noun, e.g. "recept". Plural gets an -en / -'s suffix. */
  noun: string
  plural: string
}>()

const emit = defineEmits<{ clearAll: [] }>()
</script>

<template>
  <!-- Count and active filters on one line: what you see on the left,
       why you see it on the right. Each filter clears on its own. -->
  <div class="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-default pb-3">
    <p
      class="text-sm text-muted"
      aria-live="polite"
    >
      <strong class="font-medium text-default">{{ count }}</strong>
      {{ count === 1 ? noun : plural }}
      <template v-if="filters.length">
        gevonden
      </template>
    </p>

    <div
      v-if="filters.length"
      class="flex flex-wrap items-center gap-2"
    >
      <UButton
        v-for="filter in filters"
        :key="filter.id"
        :label="filter.label"
        color="secondary"
        variant="subtle"
        size="xs"
        trailing-icon="i-lucide-x"
        class="rounded-full"
        :aria-label="`Filter ${filter.label} verwijderen`"
        @click="filter.clear()"
      />
      <UButton
        v-if="filters.length > 1"
        label="Wis alles"
        color="neutral"
        variant="link"
        size="xs"
        @click="emit('clearAll')"
      />
    </div>
  </div>
</template>
