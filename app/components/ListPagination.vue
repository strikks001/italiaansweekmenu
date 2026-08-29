<script setup lang="ts">
defineProps<{
  total: number
  perPage: number
}>()

const emit = defineEmits<{ change: [] }>()

const page = defineModel<number>('page', { required: true })
</script>

<template>
  <!-- Wrapped because Reka UI labels its controls in English; a Dutch site
       should not read out "Next Page" to a screen reader. -->
  <nav
    class="mt-10 flex justify-center"
    aria-label="Paginering"
  >
    <UPagination
      v-model:page="page"
      :items-per-page="perPage"
      :total="total"
      @update:page="emit('change')"
    >
      <template #first="{ ...props }">
        <UButton
          v-bind="props"
          icon="i-lucide-chevrons-left"
          color="neutral"
          variant="outline"
          aria-label="Eerste pagina"
        />
      </template>
      <template #prev="{ ...props }">
        <UButton
          v-bind="props"
          icon="i-lucide-chevron-left"
          color="neutral"
          variant="outline"
          aria-label="Vorige pagina"
        />
      </template>
      <template #next="{ ...props }">
        <UButton
          v-bind="props"
          icon="i-lucide-chevron-right"
          color="neutral"
          variant="outline"
          aria-label="Volgende pagina"
        />
      </template>
      <template #last="{ ...props }">
        <UButton
          v-bind="props"
          icon="i-lucide-chevrons-right"
          color="neutral"
          variant="outline"
          aria-label="Laatste pagina"
        />
      </template>
    </UPagination>
  </nav>
</template>
