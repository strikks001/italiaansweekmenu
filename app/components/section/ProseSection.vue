<script setup lang="ts">
withDefaults(defineProps<{
  /** article for a page body, div for a block inside another section. */
  as?: 'article' | 'div'
}>(), { as: 'article' })
</script>

<template>
  <!-- One place for the typography of running text, wherever it comes from:
       a markdown body, a FAQ answer, a plain paragraph. -->
  <component
    :is="as"
    class="prose dark:prose-invert"
  >
    <slot />
  </component>
</template>
