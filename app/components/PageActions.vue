<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  /** Absolute URL of the page being shared. */
  url: string
  /** Absolute image URL, used by Pinterest. */
  image?: string
  /** 'banner' sits on a colour field. */
  tone?: 'default' | 'banner'
}>(), { image: undefined, tone: 'default' })

/** Opens the browser's print dialog, where "Save as PDF" is one of the targets. */
function print() {
  window.print()
}
</script>

<template>
  <div class="print-hide flex flex-wrap items-center gap-4">
    <ShareButtons
      :title="title"
      :url="url"
      :image="image"
      :tone="tone"
    />
    <UButton
      icon="i-lucide-printer"
      color="neutral"
      :variant="tone === 'banner' ? 'solid' : 'outline'"
      size="sm"
      :class="tone === 'banner' ? 'bg-white text-vermilion-950 hover:bg-butter-200' : ''"
      @click="print"
    >
      Print
    </UButton>
  </div>
</template>
