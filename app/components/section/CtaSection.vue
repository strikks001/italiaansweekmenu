<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  text?: string
  tone?: 'butter' | 'ceramic'
}>(), { text: undefined, tone: undefined })
</script>

<template>
  <!-- Closing block of a page: one sentence and one way onward. -->
  <PageSection
    :title="title"
    :lead="text"
    :tone="tone"
    heading-size="lg"
    spacing="band"
    width="prose"
    center
  >
    <div class="flex flex-wrap justify-center gap-3">
      <slot />
    </div>
  </PageSection>
</template>
