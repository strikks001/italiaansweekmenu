<script setup lang="ts">
const props = defineProps<{
  prepMinutes: number
  cookMinutes: number
  servings: number
  difficulty: string
}>()

const items = computed(() => [
  { icon: 'i-lucide-chef-hat', label: 'Voorbereiden', value: readableDuration(props.prepMinutes) },
  { icon: 'i-lucide-flame', label: 'Bereiden', value: readableDuration(props.cookMinutes) },
  { icon: 'i-lucide-clock', label: 'Totaal', value: readableDuration(props.prepMinutes + props.cookMinutes) },
  // Servings is carried by the ingredient heading in print, where it shows
  // the scaled number rather than this fixed one.
  { icon: 'i-lucide-users', label: 'Personen', value: String(props.servings), printHide: true },
  { icon: 'i-lucide-gauge', label: 'Niveau', value: props.difficulty }
])
</script>

<template>
  <dl class="print-inline grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-butter-400 sm:grid-cols-5">
    <div
      v-for="item in items"
      :key="item.label"
      class="bg-butter-100 p-4 dark:bg-butter-950"
      :class="item.printHide ? 'print-hide' : ''"
    >
      <dt class="flex items-center gap-1.5 text-xs uppercase tracking-wide text-butter-900 dark:text-butter-200">
        <UIcon
          :name="item.icon"
          class="size-3.5"
        />
        {{ item.label }}
      </dt>
      <dd class="font-display mt-1 text-base font-bold capitalize">
        {{ item.value }}
      </dd>
    </div>
  </dl>
</template>
