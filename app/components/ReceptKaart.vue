<script setup lang="ts">
import type { ReceptenCollectionItem } from '@nuxt/content'

const props = defineProps<{
  recept: ReceptenCollectionItem
  /** Zet op true voor de eerste kaart(en) boven de vouw: laadt de afbeelding meteen. */
  prioriteit?: boolean
}>()

const totaal = computed(() =>
  props.recept.voorbereidingstijd + props.recept.bereidingstijd
)

const gangLabel: Record<string, string> = {
  antipasto: 'Antipasto',
  primo: 'Primo',
  secondo: 'Secondo',
  contorno: 'Contorno',
  dolce: 'Dolce',
  basis: 'Basis'
}
</script>

<template>
  <article class="group relative overflow-hidden rounded-xl border border-default bg-default transition hover:border-primary/40">
    <NuxtImg
      :src="recept.afbeelding"
      :alt="recept.afbeeldingAlt"
      width="600"
      height="400"
      sizes="sm:100vw md:50vw lg:33vw"
      format="webp"
      :loading="prioriteit ? 'eager' : 'lazy'"
      :preload="prioriteit"
      class="aspect-[3/2] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
    />

    <div class="p-4">
      <div class="flex flex-wrap items-center gap-2 text-xs text-muted">
        <UBadge
          :label="gangLabel[recept.gang] ?? recept.gang"
          color="primary"
          variant="subtle"
          size="sm"
        />
        <span v-if="recept.regio">{{ recept.regio }}</span>
        <span aria-hidden="true">·</span>
        <span>{{ leesbareDuur(totaal) }}</span>
      </div>

      <h3 class="mt-2 text-lg leading-snug">
        <!-- stretched-link-patroon: de hele kaart is klikbaar, maar semantisch
             blijft er precies één link met de recepttitel als linktekst. -->
        <NuxtLink
          :to="recept.path"
          class="after:absolute after:inset-0"
        >
          {{ recept.title }}
        </NuxtLink>
      </h3>

      <p class="mt-1 line-clamp-2 text-sm text-muted">
        {{ recept.description }}
      </p>
    </div>
  </article>
</template>
