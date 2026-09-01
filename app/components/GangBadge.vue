<script setup lang="ts">
defineProps<{
  gang: string
}>()
</script>

<template>
  <!--
    Botergeel met donkere tekst, zoals in het huisstijlvoorstel. Bewust geen
    UBadge met een semantische kleur: dit label is een vlaktint uit de
    huisstijl, geen status.
  -->
  <span class="inline-block rounded-full bg-boter-300 px-2.5 py-0.5 text-xs font-semibold capitalize tracking-wide text-boter-950">
    {{ gang }}
  </span>
</template>
