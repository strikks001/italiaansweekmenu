<script setup lang="ts">
import type { MenuCourse } from '~/utils/menu'

withDefaults(defineProps<{
  course: MenuCourse
  /** Wide variant: image beside the text. For a day with a single course. */
  wide?: boolean
  priority?: boolean
}>(), { wide: false, priority: false })
</script>

<template>
  <article
    class="tilt tilt-blauw group relative h-full overflow-hidden rounded-2xl border border-default bg-default hover:border-secondary"
    :class="wide ? 'sm:flex sm:items-stretch' : 'flex flex-col'"
  >
    <template v-if="course.recipe">
      <NuxtImg
        :src="course.recipe.afbeelding"
        :alt="course.recipe.afbeeldingAlt"
        width="800"
        height="600"
        sizes="100vw sm:400px"
        format="webp"
        :preload="priority"
        :loading="priority ? 'eager' : 'lazy'"
        class="w-full object-cover"
        :class="wide ? 'aspect-[4/3] sm:aspect-auto sm:w-2/5 sm:shrink-0' : 'aspect-[4/3]'"
      />

      <div class="flex flex-1 flex-col justify-center gap-2 p-5">
        <div class="flex flex-wrap items-center gap-2">
          <UBadge
            :label="course.recipe.gang"
            color="primary"
            variant="subtle"
            size="sm"
            class="capitalize"
          />
          <span class="flex items-center gap-1 text-xs text-muted">
            <UIcon
              name="i-lucide-clock"
              class="size-3"
            />
            {{ readableDuration(course.minutes) }}
          </span>
        </div>

        <h2 :class="wide ? 'text-2xl leading-tight sm:text-3xl' : 'text-lg leading-snug'">
          <NuxtLink
            :to="course.path"
            class="after:absolute after:inset-0 group-hover:text-primary"
          >
            {{ course.recipe.title }}
          </NuxtLink>
        </h2>

        <p class="line-clamp-3 text-sm text-muted">
          {{ course.note || course.recipe.description }}
        </p>

        <span class="mt-1 flex items-center gap-1 text-sm font-medium text-primary">
          Bekijk het recept
          <UIcon
            name="i-lucide-arrow-right"
            class="size-4 transition group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </template>

    <p
      v-else
      class="p-5 text-muted"
    >
      Deze dag is nog niet ingevuld.
    </p>
  </article>
</template>
