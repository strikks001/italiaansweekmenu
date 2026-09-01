<script setup lang="ts">
import type { ReceptenCollectionItem } from '@nuxt/content'

const props = defineProps<{
  products: ReceptenCollectionItem['producten']
}>()

/**
 * Shopify's CDN resizes on request, so we ask it for the size we render.
 * A plain <img> rather than NuxtImg: on a statically generated site the build
 * cannot optimise a remote image, and the shop's CDN already does it better.
 */
function shopImage(url: string, width: number): string {
  return `${url}${url.includes('?') ? '&' : '?'}width=${width}`
}

// Cards are sm:basis-1/2, so two fit from 640px. Mobile shows one at a time,
// so a second product already needs dots there.
const { fits, breakpoints } = useCarouselFit(() => props.products?.length ?? 0, 2, 640)
const multiple = computed(() => (props.products?.length ?? 0) > 1)

/*
 * Shopify cart permalink: /cart/<variant>:<qty>,<variant>:<qty>. Without
 * storefront=true it drops you straight into checkout, which is too abrupt
 * halfway through reading a recipe — this lands in the cart, where you can
 * keep shopping.
 */
const inStock = computed(() => props.products?.filter(p => p.variantId) ?? [])

const cartUrl = computed(() =>
  inStock.value.length
    ? `https://spesadaantonio.nl/cart/${inStock.value.map(p => `${p.variantId}:1`).join(',')}?storefront=true`
    : undefined
)
</script>

<template>
  <!-- Carries its own placement: the block sat inside an identical wrapper on
       both pages, and the wrapper's margin showed even without products. -->
  <section
    v-if="products?.length"
    aria-labelledby="producten"
    class="print-hide mx-auto mt-12 max-w-4xl rounded-2xl bg-keramiek-500 p-6 text-white sm:p-8"
  >
    <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
      <h2
        id="producten"
        class="text-2xl sm:text-3xl"
      >
        Bestel de ingrediënten
      </h2>
      <!-- Doubles as the shop link: without variant IDs it just points at the
           shop, with them it fills the basket in one go. -->
      <NuxtLink
        :to="cartUrl ?? 'https://spesadaantonio.nl'"
        target="_blank"
        rel="noopener"
        :title="cartUrl ? 'Openen in de winkelmand van Spesa da Antonio' : undefined"
        class="flex items-center gap-2 rounded-full bg-boter-300 px-4 py-2 text-sm font-semibold text-boter-950 transition hover:bg-boter-200"
      >
        <UIcon
          :name="cartUrl ? 'i-lucide-shopping-cart' : 'i-lucide-shopping-basket'"
          class="size-4"
        />
        <template v-if="inStock.length > 1">
          Alle {{ inStock.length }} in winkelmand
        </template>
        <template v-else-if="cartUrl">
          In winkelmand
        </template>
        <template v-else>
          Spesa da Antonio
        </template>
      </NuxtLink>
    </div>

    <!-- One code path for one product or ten: Embla simply stays inactive once
         every card is visible. -->
    <UCarousel
      v-slot="{ item }"
      :items="products"
      :arrows="multiple"
      :breakpoints="breakpoints"
      :ui="{
        // The viewport clips with overflow-hidden, which would cut off the
        // cards' hover shadow. Padding gives it room inside the clip; the
        // negative margin keeps the layout where it was.
        viewport: '-m-4 p-4',
        // Stretch, so a product with a longer reason stays as tall as the rest.
        container: 'items-stretch',
        // Just under full width on mobile: the sliver of the next card is what
        // tells you there is more than one.
        item: 'basis-[88%] sm:basis-1/2',
        // From sm two fit, so the arrows have nothing left to do.
        prev: fits ? 'sm:hidden' : '',
        next: fits ? 'sm:hidden' : ''
      }"
      class="mt-4"
    >
      <NuxtLink
        :to="item.url"
        target="_blank"
        rel="noopener"
        class="tilt tilt-rij group flex h-full items-center gap-4 rounded-2xl border-b-4 border-b-vermiljoen-500 bg-default p-3 text-default"
      >
        <!-- Tinted square: the shop shoots on white, so a plain photo would
             float without an edge. -->
        <span class="flex size-20 shrink-0 items-center justify-center rounded-xl bg-perzik-100 p-2">
          <img
            v-if="item.afbeelding"
            :src="shopImage(item.afbeelding, 160)"
            :alt="item.naam"
            width="160"
            height="160"
            loading="lazy"
            decoding="async"
            class="size-full object-contain transition duration-300 group-hover:scale-105"
          >
          <UIcon
            v-else
            name="i-lucide-shopping-basket"
            class="size-6 text-dimmed"
          />
        </span>

        <span class="flex min-w-0 flex-1 flex-col gap-0.5">
          <span class="text-sm font-semibold leading-snug group-hover:text-primary">
            {{ item.naam }}
          </span>
          <span
            v-if="item.prijs"
            class="text-sm font-semibold tabular-nums text-secondary"
          >{{ item.prijs }}</span>
          <span
            v-if="item.waarom"
            class="mt-0.5 line-clamp-2 text-xs leading-snug text-muted"
          >{{ item.waarom }}</span>
        </span>

        <UIcon
          name="i-lucide-arrow-up-right"
          class="size-4 shrink-0 text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
        />
      </NuxtLink>
    </UCarousel>
  </section>
</template>
