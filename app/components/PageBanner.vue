<script setup lang="ts">
withDefaults(defineProps<{
  /** Breadcrumb sits above the banner, on the page background. */
  breadcrumb?: { label: string, to?: string }[]
  /** Narrow on overviews, wide where a long title needs the room. */
  breed?: boolean
}>(), { breadcrumb: undefined, breed: false })
</script>

<template>
  <div>
    <UContainer
      v-if="breadcrumb"
      class="pt-6"
    >
      <UBreadcrumb
        :items="breadcrumb"
        class="breadcrumb-trail print-hide mx-auto max-w-4xl"
      />
    </UContainer>

    <!--
      The house banner: vermilion field with a scalloped edge below it.

      Body text is near-black, not white: white on vermilion scores 3.57, short
      of the 4.5 small text needs. Headings opt into `text-white` - large text
      only needs 3, and there white reads better.
    -->
    <section
      class="poster-band scallop relative bg-vermilion-500 pb-16 text-vermilion-950"
      :class="breadcrumb ? 'mt-6' : ''"
    >
      <UContainer class="pt-10 lg:pt-14">
        <div
          class="mx-auto text-center"
          :class="breed ? 'max-w-4xl' : 'max-w-2xl'"
        >
          <slot />
        </div>
      </UContainer>
    </section>
  </div>
</template>
