<script setup lang="ts">
import type { ReceptenCollectionItem } from '@nuxt/content'

defineProps<{
  steps: ReceptenCollectionItem['stappen']
}>()

// Marking your place while cooking. Session only, like the ingredient ticks.
const done = ref(new Set<number>())

function toggle(index: number) {
  const next = new Set(done.value)
  if (next.has(index)) next.delete(index)
  else next.add(index)
  done.value = next
}
</script>

<template>
  <section
    class="print-tight"
    aria-labelledby="bereiding"
  >
    <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <h2
        id="bereiding"
        class="text-xl"
      >
        Bereiding
      </h2>
      <p
        v-if="done.size"
        class="text-sm text-muted tabular-nums"
        aria-live="polite"
      >
        {{ done.size }} van {{ steps.length }} gedaan
        <UButton
          label="Wis"
          color="neutral"
          variant="link"
          size="xs"
          class="-my-1"
          @click="done = new Set()"
        />
      </p>
    </div>

    <!-- Without this line nobody discovers the steps are tappable; the number
         turning into a checkmark on hover only helps people with a mouse. -->
    <p class="print-hide mt-1 flex items-center gap-1.5 text-sm text-muted">
      <UIcon
        name="i-lucide-circle-check"
        class="size-4 shrink-0"
      />
      Tik een stap aan als je hem gedaan hebt.
    </p>

    <ol class="print-steps mt-5 space-y-2">
      <li
        v-for="(step, i) in steps"
        :key="i"
      >
        <button
          type="button"
          class="print-check group flex w-full gap-4 rounded-lg border border-transparent p-3 text-left transition hover:border-default hover:bg-elevated/60"
          :class="done.has(i) ? 'opacity-55' : ''"
          :aria-pressed="done.has(i)"
          @click="toggle(i)"
        >
          <span
            class="print-num print-plain relative flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition"
            :class="done.has(i)
              ? 'border-primary bg-primary text-inverted'
              : 'border-primary/30 bg-primary/10 text-primary'"
          >
            <template v-if="done.has(i)">
              <UIcon
                name="i-lucide-check"
                class="size-4"
              />
            </template>
            <template v-else>
              <span class="transition group-hover:opacity-0">{{ i + 1 }}</span>
              <UIcon
                name="i-lucide-check"
                class="absolute size-4 opacity-0 transition group-hover:opacity-100"
              />
            </template>
          </span>

          <span class="min-w-0">
            <span
              v-if="step.titel"
              class="block text-base font-medium"
              :class="done.has(i) ? 'line-through' : ''"
            >{{ step.titel }}</span>
            <span class="mt-1 block text-sm leading-relaxed text-toned">{{ step.tekst }}</span>
          </span>
        </button>

        <p
          v-if="step.tip"
          class="print-tip ms-15 mt-1 flex gap-2 rounded-md bg-elevated px-3 py-2 text-sm text-muted"
        >
          <UIcon
            name="i-lucide-lightbulb"
            class="mt-0.5 size-4 shrink-0 text-secondary"
          />
          <span>{{ step.tip }}</span>
        </p>
      </li>
    </ol>
  </section>
</template>
