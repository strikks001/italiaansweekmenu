<script setup lang="ts">
import type { ReceptenCollectionItem } from '@nuxt/content'

defineProps<{
  stappen: ReceptenCollectionItem['stappen']
}>()
</script>

<template>
  <section aria-labelledby="bereiding">
    <h2
      id="bereiding"
      class="text-xl"
    >
      Bereiding
    </h2>

    <ol class="mt-5 space-y-6">
      <li
        v-for="(stap, i) in stappen"
        :key="i"
        class="flex gap-4"
      >
        <span
          class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
          aria-hidden="true"
        >{{ i + 1 }}</span>

        <div class="min-w-0">
          <h3
            v-if="stap.titel"
            class="text-base"
          >
            {{ stap.titel }}
          </h3>
          <p class="mt-1 text-sm leading-relaxed text-toned">
            {{ stap.tekst }}
          </p>
          <p
            v-if="stap.tip"
            class="mt-2 flex gap-2 rounded-md bg-elevated px-3 py-2 text-sm text-muted"
          >
            <UIcon
              name="i-lucide-lightbulb"
              class="mt-0.5 size-4 shrink-0 text-secondary"
            />
            <span>{{ stap.tip }}</span>
          </p>
        </div>
      </li>
    </ol>
  </section>
</template>
