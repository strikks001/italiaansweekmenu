<script setup lang="ts">
defineProps<{
  to: string
  image: string
  alt: string
  title: string
  description?: string
  /** Loads the image eagerly. Use for the first cards above the fold. */
  priority?: boolean
}>()
</script>

<template>
  <article class="group relative overflow-hidden rounded-xl border border-default bg-default transition hover:border-primary/40">
    <NuxtImg
      :src="image"
      :alt="alt"
      width="600"
      height="400"
      sizes="sm:100vw md:50vw lg:33vw"
      format="webp"
      :loading="priority ? 'eager' : 'lazy'"
      :preload="priority"
      class="aspect-[3/2] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
    />

    <div class="p-4">
      <div class="flex flex-wrap items-center gap-2 text-xs text-muted">
        <slot name="meta" />
      </div>

      <h3 class="mt-2 text-lg leading-snug">
        <!-- Stretched link: the whole card is clickable, yet there is exactly
             one link and its text is the title. -->
        <NuxtLink
          :to="to"
          class="after:absolute after:inset-0 group-hover:text-primary"
        >
          {{ title }}
        </NuxtLink>
      </h3>

      <p
        v-if="description"
        class="mt-1 line-clamp-2 text-sm text-muted"
      >
        {{ description }}
      </p>
    </div>
  </article>
</template>
