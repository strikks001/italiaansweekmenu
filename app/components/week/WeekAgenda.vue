<script setup lang="ts">
import type { MenuDay } from '~/utils/menu'

defineProps<{
  days: MenuDay[]
}>()
</script>

<template>
  <ol class="flex flex-col gap-2">
    <li
      v-for="day in days"
      :key="day.weekday"
      class="flex items-stretch overflow-hidden rounded-2xl border bg-default"
      :class="day.courses.length ? 'border-default' : 'border-dashed border-default'"
    >
      <!-- Date column in the second colour: this is what makes the row read
           as an agenda. Empty days stay muted. -->
      <div
        class="flex w-16 shrink-0 flex-col items-center justify-center px-2 py-4 sm:w-20"
        :class="day.courses.length
          ? 'bg-ceramic-500 text-white'
          : 'bg-elevated text-toned'"
      >
        <span class="text-[0.65rem] font-semibold uppercase tracking-[0.14em] opacity-90">{{ day.short }}</span>
        <span class="font-display text-3xl font-extrabold leading-none tracking-tight tabular-nums">{{ day.dayNumber }}</span>
        <span class="text-[0.65rem] uppercase tracking-wider opacity-90">{{ day.month }}</span>
      </div>

      <p
        v-if="!day.courses.length"
        class="flex flex-1 items-center p-4 text-sm text-muted"
      >
        Nog niets ingepland
      </p>

      <ul
        v-else
        class="flex min-w-0 flex-1 flex-col divide-y divide-default"
      >
        <li
          v-for="course in day.courses"
          :key="course.path"
          class="group relative flex min-w-0 flex-1 items-center gap-3 p-3 transition hover:bg-elevated/50"
        >
          <NuxtImg
            v-if="course.recipe"
            :src="course.recipe.afbeelding"
            :alt="course.recipe.afbeeldingAlt"
            width="192"
            height="144"
            sizes="80px sm:96px"
            format="webp"
            loading="lazy"
            class="hidden size-16 shrink-0 rounded-xl object-cover sm:block sm:size-20"
          />

          <div class="min-w-0 flex-1">
            <template v-if="course.recipe">
              <div class="flex flex-wrap items-center gap-2">
                <PillBadge>{{ gangLabel(course.recipe.gang) }}</PillBadge>
                <span class="flex items-center gap-1 text-xs text-muted">
                  <UIcon
                    name="i-lucide-clock"
                    class="size-3"
                  />
                  {{ readableDuration(course.minutes) }}
                </span>
              </div>

              <h3 class="mt-1 text-base font-medium leading-snug">
                <NuxtLink
                  :to="course.path"
                  class="after:absolute after:inset-0 group-hover:text-primary"
                >
                  {{ course.recipe.title }}
                </NuxtLink>
              </h3>

              <p
                v-if="course.note"
                class="mt-0.5 line-clamp-2 text-sm leading-snug text-muted"
              >
                {{ course.note }}
              </p>
            </template>

            <template v-else>
              <p class="text-sm font-medium text-muted">
                Nog niet ingevuld
              </p>
              <p
                v-if="course.note"
                class="mt-0.5 line-clamp-2 text-sm leading-snug text-muted"
              >
                {{ course.note }}
              </p>
            </template>
          </div>

          <UIcon
            v-if="course.recipe"
            name="i-lucide-chevron-right"
            class="size-5 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-primary"
          />
        </li>
      </ul>
    </li>
  </ol>
</template>
