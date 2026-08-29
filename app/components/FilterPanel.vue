<script setup lang="ts">
import type { FilterOption } from './FilterGroup.vue'

export interface FilterGroupConfig {
  key: string
  title: string
  options: FilterOption[]
  counts?: Record<string, number>
  multiple?: boolean
}

defineProps<{
  groups: FilterGroupConfig[]
}>()

/** One record holds every group's selection, keyed by group. */
const selection = defineModel<Record<string, string | string[]>>({ required: true })
</script>

<template>
  <!-- divide-y draws one rule between groups; the padding is the same above
       and below every group, so the spacing cannot drift per position. -->
  <div class="divide-y divide-default">
    <FilterGroup
      v-for="group in groups"
      :key="group.key"
      v-model="selection[group.key]!"
      :title="group.title"
      :options="group.options"
      :counts="group.counts"
      :multiple="group.multiple"
      class="py-3 first:pt-0 last:pb-0"
    />
  </div>
</template>
