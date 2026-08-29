<script setup lang="ts">
import type { ReceptenCollectionItem } from '@nuxt/content'

defineProps<{
  groepen: ReceptenCollectionItem['ingredienten']
  personen: number
}>()
</script>

<template>
  <section aria-labelledby="ingredienten">
    <h2
      id="ingredienten"
      class="text-xl"
    >
      Ingrediënten
      <span class="text-sm font-normal text-muted">voor {{ personen }} personen</span>
    </h2>

    <div
      v-for="(groep, i) in groepen"
      :key="i"
      class="mt-5"
    >
      <h3
        v-if="groep.groep"
        class="text-sm font-semibold uppercase tracking-wide text-muted"
      >
        {{ groep.groep }}
      </h3>

      <ul class="mt-2 divide-y divide-default">
        <li
          v-for="(item, j) in groep.items"
          :key="j"
          class="flex items-baseline gap-2 py-2 text-sm"
        >
          <span class="min-w-16 shrink-0 font-medium tabular-nums">
            {{ [item.hoeveelheid, item.eenheid].filter(Boolean).join(' ') }}
          </span>
          <span>
            <!-- Ingrediënten die in de webshop te koop zijn, worden een link.
                 Dat maakt de verwijzing natuurlijk in plaats van opdringerig. -->
            <NuxtLink
              v-if="item.productUrl"
              :to="item.productUrl"
              target="_blank"
              rel="noopener"
              class="text-secondary underline decoration-dotted underline-offset-4 hover:decoration-solid"
            >{{ item.naam }}</NuxtLink>
            <template v-else>{{ item.naam }}</template>
            <span
              v-if="item.opmerking"
              class="text-muted"
            > — {{ item.opmerking }}</span>
          </span>
        </li>
      </ul>
    </div>
  </section>
</template>
