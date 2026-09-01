<script setup lang="ts">
defineProps<{
  to: string
  image: string
  alt: string
  title: string
  description?: string
  /** Loads the image eagerly. Use for the first rows above the fold. */
  priority?: boolean
}>()
</script>

<template>
  <article class="tilt tilt-row group relative flex items-center gap-4 rounded-2xl border border-default border-b-4 border-b-primary bg-default p-3 hover:border-primary">
    <NuxtImg
      :src="image"
      :alt="alt"
      width="240"
      height="180"
      sizes="96px"
      format="webp"
      :loading="priority ? 'eager' : 'lazy'"
      class="size-16 shrink-0 rounded-xl object-cover sm:size-24"
    />

    <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-center gap-2 text-xs text-muted">
        <slot name="meta" />
      </div>

      <h3 class="mt-1 text-base font-medium leading-snug sm:text-lg">
        <NuxtLink
          :to="to"
          class="after:absolute after:inset-0 group-hover:text-primary"
        >
          {{ title }}
        </NuxtLink>
      </h3>

      <p
        v-if="description"
        class="mt-0.5 line-clamp-2 text-sm text-muted"
      >
        {{ description }}
      </p>
    </div>

    <UIcon
      name="i-lucide-chevron-right"
      class="hidden size-5 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-primary sm:block"
    />
  </article>
</template>
