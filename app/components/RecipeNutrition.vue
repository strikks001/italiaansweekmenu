<script setup lang="ts">
import type { ReceptenCollectionItem } from '@nuxt/content'

const props = defineProps<{
  nutrition: NonNullable<ReceptenCollectionItem['voedingswaarde']>
}>()

const items = computed(() => [
  { label: 'Calorieën', value: props.nutrition.calorieen, unit: 'kcal' },
  { label: 'Eiwitten', value: props.nutrition.eiwitten, unit: 'g' },
  { label: 'Koolhydraten', value: props.nutrition.koolhydraten, unit: 'g' },
  { label: 'Vetten', value: props.nutrition.vetten, unit: 'g' }
].filter(i => i.value !== undefined))
</script>

<template>
  <section
    v-if="items.length"
    aria-labelledby="voedingswaarde"
  >
    <h2
      id="voedingswaarde"
      class="text-xl"
    >
      Voedingswaarde
    </h2>
    <p class="mt-1 text-sm text-muted">
      Per persoon, bij benadering.
    </p>

    <dl class="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-boter-400 sm:grid-cols-4">
      <div
        v-for="item in items"
        :key="item.label"
        class="bg-boter-100 p-4 dark:bg-boter-950"
      >
        <dt class="text-xs uppercase tracking-wide text-boter-900 dark:text-boter-200">
          {{ item.label }}
        </dt>
        <dd class="font-display mt-1 text-base font-bold tabular-nums">
          {{ item.value }} {{ item.unit }}
        </dd>
      </div>
    </dl>
  </section>
</template>
