<script setup lang="ts">
import type { ReceptenCollectionItem } from '@nuxt/content'

const props = defineProps<{
  products: ReceptenCollectionItem['producten']
}>()

/** Plain <img>: a static build cannot optimise a remote image, the CDN can. */
function shopImage(url: string, width: number): string {
  return `${url}${url.includes('?') ? '&' : '?'}width=${width}`
}

// Two cards fit from 640px.
const { breakpoints, ui: carouselUi } = useCarouselFit(
  () => props.products?.length ?? 0, 2, 640, 'basis-[88%] sm:basis-1/2'
)
const multiple = computed(() => (props.products?.length ?? 0) > 1)

// Cart permalink. Without storefront=true this drops you straight into
// checkout, which is too abrupt halfway through a recipe.
const inStock = computed(() => props.products?.filter(p => p.variantId) ?? [])

const cartUrl = computed(() =>
  inStock.value.length
    ? `https://spesadaantonio.nl/cart/${inStock.value.map(p => `${p.variantId}:1`).join(',')}?storefront=true`
    : undefined
)
</script>

<template>
  <!-- Carries its own placement; both pages had an identical wrapper. -->
  <section
    v-if="products?.length"
    aria-labelledby="producten"
    class="print-hide mx-auto mt-12 max-w-4xl rounded-2xl bg-ceramic-500 p-6 text-white sm:p-8"
  >
    <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
      <h2
        id="producten"
        class="text-2xl sm:text-3xl"
      >
        Bestel de ingrediënten
      </h2>
      <!-- Doubles as the shop link: without variant IDs it just points at
           the shop, with them it fills the basket in one go. -->
      <UButton
        :to="cartUrl ?? 'https://spesadaantonio.nl'"
        target="_blank"
        rel="noopener"
        :title="cartUrl ? 'Openen in de winkelmand van Spesa da Antonio' : undefined"
        :icon="cartUrl ? 'i-lucide-shopping-cart' : 'i-lucide-shopping-basket'"
        color="neutral"
        class="bg-butter-300 text-butter-950 hover:bg-butter-200"
        :label="inStock.length > 1
          ? `Alle ${inStock.length} in winkelmand`
          : cartUrl ? 'In winkelmand' : 'Spesa da Antonio'"
      />
    </div>

    <!-- One code path for one product or ten: Embla goes inactive once all
         cards are visible. -->
    <UCarousel
      v-slot="{ item }"
      :items="products"
      :arrows="multiple"
      :breakpoints="breakpoints"
      :ui="carouselUi"
      class="mt-4"
    >
      <NuxtLink
        :to="item.url"
        target="_blank"
        rel="noopener"
        class="tilt tilt-row group flex h-full items-center gap-4 rounded-xl border-b-4 border-b-vermilion-500 bg-default p-3 text-default"
      >
        <!-- Tinted square: the shop shoots on white. -->
        <span class="flex size-20 shrink-0 items-center justify-center rounded-xl bg-peach-100 p-2">
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
