<script setup lang="ts">
/** The site's only label. Was hand-rolled in six places before. */
withDefaults(defineProps<{
  tone?: 'butter' | 'ceramic' | 'white' | 'vermilion'
}>(), { tone: 'butter' })

const TONES = {
  butter: 'bg-butter-300 text-butter-950',
  ceramic: 'bg-ceramic-100 text-ceramic-900',
  // On a coloured field, white is the only tint with enough contrast.
  white: 'bg-white text-vermilion-950',
  vermilion: 'bg-vermilion-500 text-vermilion-950'
}
</script>

<template>
  <span
    class="inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest"
    :class="TONES[tone]"
  >
    <slot />
  </span>
</template>
