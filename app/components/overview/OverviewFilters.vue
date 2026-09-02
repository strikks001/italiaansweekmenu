<script setup lang="ts">
import type { FilterGroupConfig } from './FilterPanel.vue'

defineProps<{
  groups: FilterGroupConfig[]
  /** Result count, shown on the button that closes the slideover. */
  count: number
  noun: string
  plural: string
  hasFilters: boolean
}>()

const emit = defineEmits<{ clear: [] }>()

const selection = defineModel<Record<string, string | string[]>>({ required: true })
const open = defineModel<boolean>('open', { required: true })
</script>

<template>
  <!-- Not sticky: with four groups the lower filters would scroll out of reach
       behind the pinned toolbar. -->
  <aside class="hidden lg:block">
    <FilterPanel
      v-model="selection"
      :groups="groups"
    />
  </aside>

  <!-- No room for a sidebar on mobile, so the same panel opens in a sheet. -->
  <SideSheet
    v-model:open="open"
    title="Filters"
  >
    <FilterPanel
      v-model="selection"
      :groups="groups"
    />

    <template #footer>
      <UButton
        v-if="hasFilters"
        label="Wis filters"
        color="neutral"
        variant="outline"
        block
        class="flex-1"
        @click="emit('clear')"
      />
      <UButton
        :label="`Toon ${count} ${count === 1 ? noun : plural}`"
        color="secondary"
        block
        class="flex-1"
        @click="open = false"
      />
    </template>
  </SideSheet>
</template>
