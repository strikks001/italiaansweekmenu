<script setup lang="ts">
import type { ReceptenCollectionItem } from '@nuxt/content'

const props = defineProps<{
  products: ReceptenCollectionItem['producten']
  title?: string
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
  <section
    v-if="products?.length"
    aria-labelledby="producten"
  >
    <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
      <h2
        id="producten"
        class="text-xl"
      >
        {{ title ?? 'Bestel de ingrediënten' }}
      </h2>
      <!-- Doubles as the shop link: without variant IDs it just points at the
           shop, with them it fills the basket in one go. -->
      <NuxtLink
        :to="cartUrl ?? 'https://spesadaantonio.nl'"
        target="_blank"
        rel="noopener"
        :title="cartUrl ? 'Openen in de winkelmand van Spesa da Antonio' : undefined"
        class="flex items-center gap-1.5 text-sm font-medium text-secondary transition hover:underline hover:underline-offset-4"
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
      :dots="multiple"
      :breakpoints="breakpoints"
      :ui="{
        // The viewport clips with overflow-hidden, which would cut off the
        // cards' hover shadow. Padding gives it room inside the clip; the
        // negative margin keeps the layout where it was.
        viewport: '-m-4 p-4',
        item: 'basis-full sm:basis-1/2',
        // One card per screen on mobile, so dots are needed there even when
        // everything fits from sm onwards.
        dots: fits ? 'sm:hidden' : ''
      }"
      class="mt-4"
      :class="multiple ? (fits ? 'pb-10 sm:pb-0' : 'pb-10') : ''"
    >
      <NuxtLink
        :to="item.url"
        target="_blank"
        rel="noopener"
        class="group flex h-full items-center gap-4 rounded-2xl border border-default bg-default p-3 transition hover:border-secondary hover:shadow-md"
      >
        <!-- Tinted square: the shop shoots on white, so a plain photo would
             float without an edge. -->
        <span class="flex size-20 shrink-0 items-center justify-center rounded-xl bg-elevated p-2">
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
          <span class="text-sm font-medium leading-snug group-hover:text-secondary">
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
          class="size-4 shrink-0 text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-secondary"
        />
      </NuxtLink>
    </UCarousel>
  </section>
</template>
