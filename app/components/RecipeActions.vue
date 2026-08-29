<script setup lang="ts">
defineProps<{
  title: string
  /** Absolute URL of the page being shared. */
  url: string
  /** Absolute image URL, used by Pinterest. */
  image?: string
}>()

/** Opens the browser's print dialog, where "Save as PDF" is one of the targets. */
function printRecipe() {
  window.print()
}
</script>

<template>
  <div class="print-hide flex flex-wrap items-center gap-4">
    <ShareButtons
      :title="title"
      :url="url"
      :image="image"
    />
    <UButton
      icon="i-lucide-printer"
      color="neutral"
      variant="outline"
      size="sm"
      @click="printRecipe"
    >
      Print
    </UButton>
  </div>
</template>
