<script setup lang="ts">
import type { ReceptenCollectionItem } from '@nuxt/content'

const props = defineProps<{
  groups: ReceptenCollectionItem['ingredienten']
  /** Servings the recipe was written for. */
  servings: number
}>()

const MIN = 1
const MAX = 20

const chosen = ref(props.servings)
const factor = computed(() => chosen.value / props.servings)
const isScaled = computed(() => chosen.value !== props.servings)

function changeServings(step: number) {
  chosen.value = Math.min(MAX, Math.max(MIN, chosen.value + step))
}

/*
 * On mobile the list starts open and folds away once you scroll past it, so
 * what travels along is a slim bar. On desktop the column is always visible,
 * hence every toggle is lg:hidden.
 *
 * We measure a zero-height marker above the panel, never the panel itself: a
 * pinned sticky element sits at exactly the header height, so comparing its
 * own top can only ever collapse, never expand again. The marker keeps moving
 * with the scroll and is unaffected by the panel's height, which also rules
 * out a feedback loop between folding and layout.
 */
const open = ref(true)
const marker = ref<HTMLElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const stuck = ref(false)

/*
 * On desktop the panel only pins when it fits on screen. A list that is taller
 * than the viewport would otherwise stick with its bottom cut off, and the last
 * ingredients stay unreachable. An inner scrollbar solves that on paper but not
 * for the reader: nobody spots a scroll area inside a panel. So a long list
 * simply scrolls along with the page.
 */
const fits = ref(true)

// A tap beats the scroll rule: while the panel is pinned the marker sits above
// the viewport, so without this the next scroll event would fold it straight
// back shut. Scrolling back up to the panel's own place hands control back.
const tapped = ref(false)

function toggleOpen() {
  open.value = !open.value
  tapped.value = true
}

onMounted(() => {
  // Measure the header rather than parsing --ui-header-height: that value is
  // "4rem", and parseInt would read it as 4.
  const headerHeight = document.querySelector('header')?.getBoundingClientRect().height ?? 64

  // Fold only after scrolling a bit beyond the header, so the full list stays
  // readable for a moment instead of snapping shut the instant it pins. The
  // 80px between the two lines is the hysteresis that stops flickering.
  const foldBelow = headerHeight - 140
  const unfoldAbove = headerHeight - 60

  /*
   * Folding changes the page height, and the browser answers that by nudging
   * the scroll position to keep the view steady (scroll anchoring). That nudge
   * moves the marker back across the threshold, which folds it again: a loop
   * you see as flickering. overflow-anchor:none on the panel stops the nudge;
   * this cooldown makes sure any remaining scroll jolt cannot flip the state
   * before the animation has finished.
   */
  let settleUntil = 0

  function onScroll() {
    const top = marker.value?.getBoundingClientRect().top
    if (top === undefined) return

    stuck.value = top < headerHeight
    if (performance.now() < settleUntil) return

    if (top > unfoldAbove) {
      tapped.value = false
      if (!open.value) {
        open.value = true
        settleUntil = performance.now() + 400
      }
    } else if (top < foldBelow && open.value && !tapped.value) {
      open.value = false
      settleUntil = performance.now() + 400
    }
  }

  function measure() {
    const el = panel.value
    if (!el) return
    // Sticky offset on desktop is the header plus 1.5rem, and we leave a little
    // room below so the panel does not touch the bottom edge.
    fits.value = el.scrollHeight + headerHeight + 24 + 24 <= window.innerHeight
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', measure, { passive: true })
  onScroll()
  measure()

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', measure)
  })
})

// Ticking off while shopping or cooking. Session only: a stale checklist from
// last week would confuse more than it helps.
const ticked = ref(new Set<string>())

function toggle(key: string) {
  const next = new Set(ticked.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  ticked.value = next
}

function reset() {
  chosen.value = props.servings
  ticked.value = new Set()
}
</script>

<template>
  <!-- display:contents so this wrapper never becomes the sticky containing
       block; the panel must be able to travel past the steps. -->
  <div class="contents">
    <div
      ref="marker"
      aria-hidden="true"
      class="h-0"
    />

    <!--
      Sticks under the header at every size: while cooking you keep looking back
      at the list. On mobile it runs full width with a rule above and below, like
      the toolbar on the overview pages; from lg it becomes a card in the sidebar.
    -->
    <section
      ref="panel"
      aria-labelledby="ingredienten"
      class="print-flat sticky top-(--ui-header-height) z-20 -mx-4 border-y border-default px-4 transition-shadow duration-300 [overflow-anchor:none] sm:-mx-6 sm:px-6 lg:top-[calc(var(--ui-header-height)+1.5rem)] lg:mx-0 lg:rounded-xl lg:border lg:px-0 lg:shadow-none"
      :class="[
        stuck ? 'bg-default/95 shadow-sm backdrop-blur' : 'bg-default',
        fits ? '' : 'lg:static'
      ]"
    >
      <div class="flex items-center justify-between gap-2 py-3 lg:px-3 lg:pb-2">
        <h2
          id="ingredienten"
          class="flex items-baseline gap-2 text-lg"
        >
          Ingrediënten
          <span class="print-servings text-sm font-normal tabular-nums text-muted lg:hidden">
            {{ chosen }} {{ chosen === 1 ? 'persoon' : 'personen' }}
          </span>
        </h2>

        <UButton
          icon="i-lucide-chevron-down"
          color="neutral"
          variant="ghost"
          size="sm"
          class="print-hide transition-transform duration-300 lg:hidden"
          :class="open ? 'rotate-180' : ''"
          :aria-expanded="open"
          aria-controls="ingredientenlijst"
          :aria-label="open ? 'Ingrediënten verbergen' : 'Ingrediënten tonen'"
          @click="toggleOpen"
        />
      </div>

      <!-- grid-rows 0fr -> 1fr animates to the content's own height, which a
           max-height guess cannot do without clipping or lagging. -->
      <div
        id="ingredientenlijst"
        class="print-open grid transition-[grid-template-rows] duration-300 ease-out lg:grid-rows-[1fr]"
        :class="open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
      >
        <div class="overflow-hidden">
          <div class="print-flat print-cols max-h-[60vh] overflow-y-auto pb-4 lg:max-h-none lg:overflow-visible lg:px-3 lg:pb-3">
            <!-- Servings sits with the list, not above it: it adjusts the list,
                 it is not the headline of this panel. -->
            <div class="print-hide flex items-center justify-between gap-2 border-b border-default pb-2 text-sm">
              <span class="text-muted">Voor {{ chosen }} {{ chosen === 1 ? 'persoon' : 'personen' }}</span>
              <div class="print-hide flex items-center gap-1">
                <UButton
                  icon="i-lucide-minus"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  :disabled="chosen <= MIN"
                  aria-label="Eén persoon minder"
                  @click="changeServings(-1)"
                />
                <span
                  class="w-20 text-center font-medium tabular-nums"
                  aria-live="polite"
                >
                  {{ chosen }} {{ chosen === 1 ? 'persoon' : 'personen' }}
                </span>
                <UButton
                  icon="i-lucide-plus"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  :disabled="chosen >= MAX"
                  aria-label="Eén persoon meer"
                  @click="changeServings(1)"
                />
              </div>
            </div>

            <div
              v-for="(group, gi) in groups"
              :key="gi"
              class="mt-3"
            >
              <h3
                v-if="group.groep"
                class="text-xs font-semibold uppercase tracking-wide text-muted"
              >
                {{ group.groep }}
              </h3>

              <ul class="mt-1 divide-y divide-default">
                <li
                  v-for="(item, ii) in group.items"
                  :key="ii"
                  class="py-1.5"
                >
                  <!-- The whole row is the checkbox: while cooking you tap, you
                       do not aim. The shop link sits outside it, so tapping to
                       buy does not tick the ingredient off. -->
                  <button
                    type="button"
                    class="print-check flex w-full items-start gap-2 text-left text-sm transition"
                    :class="ticked.has(`${gi}-${ii}`) ? 'opacity-45' : ''"
                    :aria-pressed="ticked.has(`${gi}-${ii}`)"
                    @click="toggle(`${gi}-${ii}`)"
                  >
                    <UIcon
                      :name="ticked.has(`${gi}-${ii}`) ? 'i-lucide-square-check-big' : 'i-lucide-square'"
                      class="mt-0.5 size-4 shrink-0"
                      :class="ticked.has(`${gi}-${ii}`) ? 'text-primary' : 'text-dimmed'"
                    />
                    <span
                      class="min-w-12 shrink-0 font-medium tabular-nums"
                      :class="isScaled && item.hoeveelheid ? 'text-primary' : ''"
                    >
                      {{ [scaleQuantity(item.hoeveelheid, factor), item.eenheid].filter(Boolean).join(' ') }}
                    </span>
                    <span :class="ticked.has(`${gi}-${ii}`) ? 'line-through' : ''">
                      {{ item.naam }}
                      <span
                        v-if="item.opmerking"
                        class="text-muted"
                      > — {{ item.opmerking }}</span>
                    </span>
                  </button>

                  <!-- ms-20 lines the link up with the ingredient name: icon
                       (1rem) plus gap (0.5rem) plus quantity column (3rem). -->
                  <NuxtLink
                    v-if="item.productUrl"
                    :to="item.productUrl"
                    target="_blank"
                    rel="noopener"
                    class="ms-20 mt-0.5 inline-flex items-center gap-1 text-xs text-secondary underline decoration-dotted underline-offset-4 hover:decoration-solid"
                  >
                    <UIcon
                      name="i-lucide-shopping-basket"
                      class="size-3"
                    />
                    Bestel bij Spesa da Antonio
                  </NuxtLink>
                </li>
              </ul>
            </div>

            <UButton
              v-if="isScaled || ticked.size"
              label="Begin opnieuw"
              color="neutral"
              variant="link"
              size="xs"
              icon="i-lucide-rotate-ccw"
              class="print-hide mt-2"
              @click="reset"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
