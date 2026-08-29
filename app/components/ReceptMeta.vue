<script setup lang="ts">
const props = defineProps<{
  voorbereidingstijd: number
  bereidingstijd: number
  personen: number
  moeilijkheid: string
}>()

const totaal = computed(() => props.voorbereidingstijd + props.bereidingstijd)

const items = computed(() => [
  { icon: 'i-lucide-knife', label: 'Voorbereiden', waarde: leesbareDuur(props.voorbereidingstijd) },
  { icon: 'i-lucide-flame', label: 'Bereiden', waarde: leesbareDuur(props.bereidingstijd) },
  { icon: 'i-lucide-clock', label: 'Totaal', waarde: leesbareDuur(totaal.value) },
  { icon: 'i-lucide-users', label: 'Personen', waarde: String(props.personen) },
  { icon: 'i-lucide-gauge', label: 'Niveau', waarde: props.moeilijkheid }
])
</script>

<template>
  <dl class="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-accented sm:grid-cols-5">
    <div
      v-for="item in items"
      :key="item.label"
      class="bg-default p-4"
    >
      <dt class="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted">
        <UIcon
          :name="item.icon"
          class="size-3.5"
        />
        {{ item.label }}
      </dt>
      <dd class="mt-1 text-sm font-medium capitalize">
        {{ item.waarde }}
      </dd>
    </div>
  </dl>
</template>
