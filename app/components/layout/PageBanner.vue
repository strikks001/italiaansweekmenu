<script setup lang="ts">
const props = withDefaults(defineProps<{
  /** Breadcrumb sits above the banner, on the page background. */
  breadcrumb?: { label: string, to?: string }[]
  /** Narrow on overviews, wide where a long title needs the room. */
  breed?: boolean
  /** Anchor for the round jump button on the bottom edge. */
  jumpTo?: string
  /** Accessible name for that button; it carries no visible text. */
  jumpLabel?: string
}>(), {
  breadcrumb: undefined,
  breed: false,
  jumpTo: undefined,
  jumpLabel: 'Verder lezen'
})

// The router turns the hash into a pushState, and that leaves the browser's
// focus point behind: Tab would resume at the top. So scroll and focus by hand.
function jump(event: MouseEvent) {
  const target = props.jumpTo && document.querySelector<HTMLElement>(props.jumpTo)
  if (!target) return

  event.preventDefault()
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  target.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' })

  target.tabIndex = -1
  target.focus({ preventScroll: true })
}
</script>

<template>
  <div>
    <!--
      The house banner: vermilion field with a scalloped edge below it.

      Body text is near-black, not white: white on vermilion scores 3.57, short
      of the 4.5 small text needs. Headings opt into `text-white` - large text
      only needs 3, and there white reads better.
    -->
    <section class="poster-band scallop relative bg-vermilion-500 pb-16 text-vermilion-950">
      <UContainer
        v-if="breadcrumb"
        class="pt-5"
      >
        <UBreadcrumb
          :items="breadcrumb"
          class="breadcrumb-banner print-hide mx-auto max-w-4xl"
        />
      </UContainer>

      <UContainer :class="breadcrumb ? 'pt-6 lg:pt-8' : 'pt-10 lg:pt-14'">
        <div
          class="mx-auto text-center"
          :class="breed ? 'max-w-4xl' : 'max-w-2xl'"
        >
          <slot />
        </div>
      </UContainer>

      <!-- Straddles the scalloped edge, so it reads as the way out of the
           banner rather than one more control inside it. -->
      <NuxtLink
        v-if="jumpTo"
        :to="jumpTo"
        :aria-label="jumpLabel"
        class="jump-nudge print-hide absolute bottom-0 left-1/2 z-10 flex size-12 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full bg-white text-vermilion-500 shadow-md ring-1 ring-vermilion-950/10 transition hover:bg-butter-100"
        @click="jump"
      >
        <UIcon
          name="i-lucide-arrow-down"
          class="size-5"
        />
      </NuxtLink>
    </section>
  </div>
</template>
