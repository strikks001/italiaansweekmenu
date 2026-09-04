<script setup lang="ts">
withDefaults(defineProps<{
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
          <p class="print-mark hidden">
            Italiaans<span>weekmenu</span>
          </p>
          <slot />
        </div>
      </UContainer>

      <!-- Straddles the scalloped edge, so it reads as the way out of the
           banner rather than one more control inside it. -->
      <JumpLink
        v-if="jumpTo"
        :to="jumpTo"
        :label="jumpLabel"
        edge
      />
    </section>
  </div>
</template>
