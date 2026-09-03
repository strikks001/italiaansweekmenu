<script setup lang="ts">
const props = withDefaults(defineProps<{
  to: string
  /** Accessible name: the button itself carries no text. */
  label: string
  text?: string
  /** Straddle the bottom edge of a coloured band instead of sitting in flow. */
  edge?: boolean
}>(), { text: undefined, edge: false })

// The router's pushState leaves the focus point behind, so Tab would resume at
// the top. Hence scrolling and focusing by hand.
function jump(event: MouseEvent) {
  const target = document.querySelector<HTMLElement>(props.to)
  if (!target) return

  event.preventDefault()
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  target.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' })

  target.tabIndex = -1
  target.focus({ preventScroll: true })
}
</script>

<template>
  <div
    class="print-hide flex flex-col items-center gap-3 text-center"
    :class="edge ? 'absolute inset-x-0 bottom-0 z-10' : ''"
  >
    <p
      v-if="text"
      class="text-sm font-semibold"
    >
      {{ text }}
    </p>

    <NuxtLink
      :to="to"
      :aria-label="label"
      class="flex size-12 items-center justify-center rounded-full bg-white text-vermilion-500 shadow-md ring-1 ring-vermilion-950/10 transition hover:bg-butter-100"
      :class="edge ? 'translate-y-1/2' : ''"
      @click="jump"
    >
      <UIcon
        name="i-lucide-arrow-down"
        class="jump-nudge size-5"
      />
    </NuxtLink>
  </div>
</template>
