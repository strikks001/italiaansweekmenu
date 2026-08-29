<script setup lang="ts">
import type { ReceptenCollectionItem } from '@nuxt/content'

defineProps<{
  products: ReceptenCollectionItem['producten']
  title?: string
}>()
</script>

<template>
  <section
    v-if="products?.length"
    aria-labelledby="producten"
    class="rounded-xl border border-default bg-elevated/50 p-6"
  >
    <h2
      id="producten"
      class="text-lg"
    >
      {{ title ?? 'Hiermee lukt het het beste' }}
    </h2>
    <p class="mt-1 text-sm text-muted">
      Deze producten bestel je bij
      <NuxtLink
        to="https://www.spesadaantonio.nl"
        target="_blank"
        rel="noopener"
        class="text-secondary underline underline-offset-4"
      >Spesa da Antonio</NuxtLink>.
    </p>

    <ul class="mt-4 grid gap-3 sm:grid-cols-2">
      <li
        v-for="product in products"
        :key="product.url"
      >
        <NuxtLink
          :to="product.url"
          target="_blank"
          rel="noopener"
          class="group flex gap-3 rounded-lg border border-default bg-default p-3 transition hover:border-secondary/50"
        >
          <NuxtImg
            v-if="product.afbeelding"
            :src="product.afbeelding"
            :alt="product.naam"
            width="64"
            height="64"
            loading="lazy"
            class="size-16 shrink-0 rounded object-cover"
          />
          <span class="min-w-0">
            <span class="block text-sm font-medium group-hover:text-secondary">
              {{ product.naam }}
              <UIcon
                name="i-lucide-arrow-up-right"
                class="size-3.5 align-text-top"
              />
            </span>
            <span
              v-if="product.prijs"
              class="block text-sm text-muted"
            >{{ product.prijs }}</span>
            <span
              v-if="product.waarom"
              class="mt-1 block text-xs leading-snug text-muted"
            >{{ product.waarom }}</span>
          </span>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>
