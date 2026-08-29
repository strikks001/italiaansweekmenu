<script setup lang="ts">
// Rendered by Satori into a 1200x630 PNG: the preview shown when someone
// shares a page. Satori supports flexbox only, no grid.
withDefaults(defineProps<{
  title?: string
  description?: string
}>(), {
  title: 'Italiaansweekmenu',
  description: ''
})
</script>

<template>
  <div class="flex h-full w-full flex-col justify-between bg-neutral-900 p-20">
    <div class="flex items-center text-3xl font-semibold text-neutral-400">
      italiaansweekmenu.nl
    </div>

    <div class="flex flex-col">
      <div class="flex text-[68px] font-bold leading-tight text-white">
        {{ title }}
      </div>
      <div
        v-if="description"
        class="mt-6 flex text-[30px] leading-snug text-neutral-300"
      >
        {{ description.slice(0, 130) }}
      </div>
    </div>

    <div class="flex items-center text-2xl text-neutral-400">
      Elke week een nieuw Italiaans menu
    </div>
  </div>
</template>
