<script setup lang="ts">
// Rendered by Satori into a 1200x630 PNG: the preview shown when someone
// shares a page. Satori does flexbox only, and does not know our theme, so
// every colour is written out here.
const props = withDefaults(defineProps<{
  title?: string
  description?: string
}>(), {
  title: 'Italiaansweekmenu',
  description: ''
})

// Two lines fit; cut on a word so it does not end mid-sentence.
const MAX = 150

const lead = computed(() => {
  if (props.description.length <= MAX) return props.description
  return props.description.slice(0, MAX).replace(/\s+\S*$/, '') + '…'
})

const VERMILJOEN = '#ff3b14'
const INKT = '#420a03'
// butter-200, not 300: 3.10 against the red where 300 scores 2.97.
const BOTER = '#ffefb4'
const KERAMIEK = '#2b2d7a'

// The scalloped edge of the site: white circles rising into the red. Drawn as
// circles in a clipped row, because Satori has no radial gradients.
const BOLLEN = 24
</script>

<template>
  <div
    style="display: flex; flex-direction: column; height: 100%; width: 100%;"
    :style="{ backgroundColor: VERMILJOEN }"
  >
    <div style="display: flex; flex-direction: column; flex: 1; justify-content: center; padding: 0 80px;">
      <!-- The wordmark, as in the header: one half carries the accent. -->
      <div style="display: flex; font-family: 'Bricolage Grotesque'; font-size: 32px; font-weight: 800; margin-bottom: 40px;">
        <div style="display: flex; color: white;">
          Italiaans
        </div>
        <div
          style="display: flex;"
          :style="{ color: BOTER }"
        >
          weekmenu
        </div>
      </div>

      <div style="display: flex; font-family: 'Bricolage Grotesque'; font-size: 68px; font-weight: 800; line-height: 1.05; letter-spacing: -0.025em; color: white;">
        {{ title }}
      </div>

      <div
        v-if="lead"
        style="display: flex; margin-top: 24px; font-size: 28px; line-height: 1.35;"
        :style="{ color: INKT }"
      >
        {{ lead }}
      </div>
    </div>

    <!-- Clipped to half the circle, so only the bumps show. -->
    <div style="display: flex; height: 25px; overflow: hidden;">
      <div
        v-for="n in BOLLEN"
        :key="n"
        style="width: 50px; height: 50px; border-radius: 25px; background-color: white;"
      />
    </div>

    <div style="display: flex; align-items: center; justify-content: space-between; height: 92px; padding: 0 80px; background-color: white;">
      <div
        style="display: flex; font-size: 26px; font-weight: 600;"
        :style="{ color: KERAMIEK }"
      >
        Elke week een nieuw Italiaans menu
      </div>
      <div
        style="display: flex; font-size: 24px;"
        :style="{ color: VERMILJOEN }"
      >
        italiaansweekmenu.nl
      </div>
    </div>
  </div>
</template>
