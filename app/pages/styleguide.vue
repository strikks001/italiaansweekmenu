<script setup lang="ts">
/**
 * Living styleguide: renders the real components and reads the real tokens, so
 * it cannot drift from the site. Not for visitors - noindex via routeRules.
 */
const SCALES = ['vermilion', 'ceramic', 'butter', 'peach'] as const
const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const

const hexes = ref<Record<string, string>>({})
const contrasts = ref<{ pair: string, ratio: number, small: boolean, large: boolean }[]>([])

/** Relative luminance per WCAG 2.1. */
function luminance([r, g, b]: number[]) {
  const f = (c: number) => {
    const v = c! / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f(r!) + 0.7152 * f(g!) + 0.0722 * f(b!)
}

onMounted(() => {
  const root = getComputedStyle(document.documentElement)

  // Canvas normalises every CSS colour notation to sRGB, including oklch.
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  const toRgb = (value: string) => {
    ctx.clearRect(0, 0, 1, 1)
    ctx.fillStyle = value
    ctx.fillRect(0, 0, 1, 1)
    const d = ctx.getImageData(0, 0, 1, 1).data
    return [d[0]!, d[1]!, d[2]!]
  }

  const found: Record<string, string> = {}
  for (const scale of SCALES) {
    for (const shade of SHADES) {
      const key = `${scale}-${shade}`
      found[key] = root.getPropertyValue(`--color-${key}`).trim()
    }
  }
  hexes.value = found

  const ratio = (a: string, b: string) => {
    const [l1, l2] = [luminance(toRgb(a)), luminance(toRgb(b))]
    const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]
    return (hi + 0.05) / (lo + 0.05)
  }

  contrasts.value = [
    ['wit op vermiljoen', '#ffffff', found['vermilion-500']!],
    ['inkt op vermiljoen', found['vermilion-950']!, found['vermilion-500']!],
    ['wit op keramiek', '#ffffff', found['ceramic-500']!],
    ['inkt op botergeel', found['butter-950']!, found['butter-300']!],
    ['vermiljoen op wit', found['vermilion-500']!, '#ffffff']
  ].map(([pair, fg, bg]) => {
    const r = ratio(fg!, bg!)
    return { pair: pair!, ratio: Math.round(r * 100) / 100, small: r >= 4.5, large: r >= 3 }
  })
})

const TYPE_SCALE = [
  { label: 'Vraag (hero)', class: 'poster-question' },
  { label: 'Gerecht (paneel)', class: 'poster-dish' },
  { label: 'Pagina-kop h1', class: 'text-4xl sm:text-5xl' },
  { label: 'Sectie-kop h2', class: 'text-3xl sm:text-4xl' },
  { label: 'Broodtekst', class: 'text-base font-sans' },
  { label: 'Bijschrift', class: 'text-sm text-muted' }
]

const RADII = [
  { label: 'Blok', class: 'rounded-2xl' },
  { label: 'Genest', class: 'rounded-xl' },
  { label: 'Pil', class: 'rounded-full' }
]

useSeoMeta({ title: 'Styleguide', robots: 'noindex, nofollow' })
</script>

<template>
  <div>
    <PageBanner
      breed
      :breadcrumb="[{ label: 'Home', to: '/' }, { label: 'Styleguide' }]"
    >
      <h1 class="text-4xl text-white sm:text-5xl">
        Styleguide
      </h1>
      <p class="mt-4 text-lg">
        Gegenereerd uit de echte tokens en componenten, dus altijd actueel.
      </p>
    </PageBanner>

    <UContainer class="py-10 lg:py-14">
      <div class="mx-auto flex max-w-4xl flex-col gap-14">
        <section>
          <h2 class="text-3xl">
            Palet
          </h2>
          <div
            v-for="scale in SCALES"
            :key="scale"
            class="mt-6"
          >
            <p class="text-xs font-bold uppercase tracking-widest text-muted">
              {{ scale }}
            </p>
            <div class="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-11">
              <!-- Inline style from the CSS variable, not a dynamic class:
                   Tailwind cannot see composed class names and purges them. -->
              <div
                v-for="shade in SHADES"
                :key="shade"
                class="overflow-hidden rounded-xl border border-default"
              >
                <div
                  class="h-10"
                  :style="{ background: hexes[`${scale}-${shade}`] }"
                />
                <p class="px-1 py-0.5 text-center text-[0.6rem] tabular-nums text-muted">
                  {{ shade }}
                </p>
                <p class="px-1 pb-1 text-center text-[0.55rem] uppercase text-dimmed">
                  {{ hexes[`${scale}-${shade}`] }}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-3xl">
            Contrast
          </h2>
          <p class="mt-2 text-muted">
            Live berekend volgens WCAG 2.1. Klein = 4,5 vereist, groot = 3.
          </p>
          <dl class="mt-5 grid gap-px overflow-hidden rounded-2xl bg-accented sm:grid-cols-2">
            <div
              v-for="c in contrasts"
              :key="c.pair"
              class="flex items-center justify-between gap-3 bg-default p-4"
            >
              <dt class="text-sm">
                {{ c.pair }}
              </dt>
              <dd class="flex items-center gap-2">
                <span class="font-display text-base font-bold tabular-nums">{{ c.ratio }}</span>
                <PillBadge :tone="c.small ? 'ceramic' : c.large ? 'butter' : 'vermilion'">
                  {{ c.small ? 'klein ok' : c.large ? 'alleen groot' : 'te laag' }}
                </PillBadge>
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <h2 class="text-3xl">
            Typografie
          </h2>
          <div class="mt-5 divide-y divide-default">
            <div
              v-for="t in TYPE_SCALE"
              :key="t.label"
              class="py-4"
            >
              <p class="text-xs font-bold uppercase tracking-widest text-muted">
                {{ t.label }}
              </p>
              <p
                class="mt-1"
                :class="t.class"
              >
                Wat eten we vandaag?
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-3xl">
            Labels
          </h2>
          <div class="mt-5 flex flex-wrap items-center gap-3">
            <PillBadge>botergeel</PillBadge>
            <PillBadge tone="ceramic">
              keramiek
            </PillBadge>
            <PillBadge tone="vermilion">
              vermiljoen
            </PillBadge>
            <span class="rounded-2xl bg-vermilion-500 p-3">
              <PillBadge tone="white">op een vlak</PillBadge>
            </span>
          </div>
        </section>

        <section>
          <h2 class="text-3xl">
            Knoppen
          </h2>
          <div class="mt-5 flex flex-wrap items-center gap-3">
            <UButton label="Primair" />
            <UButton
              label="Secundair"
              color="secondary"
            />
            <UButton
              label="Omlijnd"
              color="neutral"
              variant="outline"
            />
            <UButton
              label="Subtiel"
              color="neutral"
              variant="ghost"
            />
          </div>
        </section>

        <section>
          <h2 class="text-3xl">
            Afrondingen
          </h2>
          <div class="mt-5 flex flex-wrap gap-4">
            <div
              v-for="r in RADII"
              :key="r.label"
              class="flex flex-col items-center gap-2"
            >
              <div
                class="size-20 bg-ceramic-500"
                :class="r.class"
              />
              <p class="text-xs text-muted">
                {{ r.label }}
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-3xl">
            Schulprand
          </h2>
          <div class="mt-5 scallop relative rounded-t-2xl bg-vermilion-500 pb-12 pt-8 text-center text-vermilion-950">
            <p class="font-display text-2xl font-extrabold">
              Onder een gekleurd vlak
            </p>
          </div>
        </section>
      </div>
    </UContainer>
  </div>
</template>
