<script setup lang="ts">
withDefaults(defineProps<{
  as?: 'article' | 'div'
}>(), { as: 'article' })
</script>

<template>
  <component
    :is="as"
    class="prose dark:prose-invert"
  >
    <slot />
  </component>
</template>
