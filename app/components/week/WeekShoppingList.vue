<script setup lang="ts">
import type { ShoppingItem } from '~/utils/shopping'

const props = defineProps<{
  items: ShoppingItem[]
}>()

// Session only: a checklist from last week's shopping would confuse.
const ticked = ref(new Set<string>())

function toggle(key: string) {
  const next = new Set(ticked.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  ticked.value = next
}

const remaining = computed(() => props.items.length - ticked.value.size)

const copied = ref(false)

/** Handy for a notes app or a message to whoever is doing the shopping. */
async function copyList() {
  const text = props.items
    .map(i => `- ${[i.hoeveelheid, i.eenheid, i.naam].filter(Boolean).join(' ')}`)
    .join('\n')
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // Clipboard blocked: the list is on screen anyway.
  }
}
</script>

<template>
  <section
    v-if="items.length"
    aria-labelledby="boodschappen"
  >
    <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <div>
        <h2
          id="boodschappen"
          class="text-2xl"
        >
          Boodschappenlijst
        </h2>
        <p class="mt-1 text-sm text-muted">
          Alle ingrediënten van deze week bij elkaar opgeteld.
          <span class="print-hide">Tik een regel aan om af te strepen.</span>
        </p>
      </div>

      <div class="print-hide flex items-center gap-2">
        <UButton
          :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
          :label="copied ? 'Gekopieerd' : 'Kopieer'"
          color="neutral"
          variant="outline"
          size="sm"
          @click="copyList"
        />
        <span
          class="text-sm tabular-nums text-muted"
          aria-live="polite"
        >
          {{ remaining }} van {{ items.length }}
        </span>
      </div>
    </div>

    <ul class="print-cols mt-5 grid gap-x-8 border-t border-default sm:grid-cols-2">
      <li
        v-for="item in items"
        :key="item.key"
        class="border-b border-default py-2"
      >
        <!-- The whole row ticks off: while shopping you tap, you do not aim. -->
        <button
          type="button"
          class="print-check flex w-full items-start gap-2 text-left text-sm transition"
          :class="ticked.has(item.key) ? 'opacity-45' : ''"
          :aria-pressed="ticked.has(item.key)"
          @click="toggle(item.key)"
        >
          <UIcon
            :name="ticked.has(item.key) ? 'i-lucide-square-check-big' : 'i-lucide-square'"
            class="mt-0.5 size-4 shrink-0"
            :class="ticked.has(item.key) ? 'text-primary' : 'text-dimmed'"
          />
          <span class="min-w-14 shrink-0 font-medium tabular-nums">
            {{ [item.hoeveelheid, item.eenheid].filter(Boolean).join(' ') }}
          </span>
          <span :class="ticked.has(item.key) ? 'line-through' : ''">
            {{ item.naam }}
            <span
              v-if="item.recepten.length > 1"
              class="print-hide text-xs text-muted"
            >· {{ item.recepten.length }} gerechten</span>
          </span>
        </button>
      </li>
    </ul>
  </section>
</template>
