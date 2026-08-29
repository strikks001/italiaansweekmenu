<script setup lang="ts">
const { data: recepten } = await useAsyncData('recepten:alle', () =>
  queryCollection('recepten')
    .where('concept', '=', false)
    .order('gepubliceerd', 'DESC')
    .all()
)

const gangen = [
  { value: 'alle', label: 'Alles' },
  { value: 'antipasto', label: 'Antipasto' },
  { value: 'primo', label: 'Primo' },
  { value: 'secondo', label: 'Secondo' },
  { value: 'contorno', label: 'Contorno' },
  { value: 'dolce', label: 'Dolce' }
]

const gekozen = ref('alle')

const zichtbaar = computed(() =>
  gekozen.value === 'alle'
    ? recepten.value ?? []
    : (recepten.value ?? []).filter(r => r.gang === gekozen.value)
)

const titel = 'Alle Italiaanse recepten'
const omschrijving = 'Blader door ons complete archief met authentieke Italiaanse recepten, van antipasto tot dolce. Met boodschappenlijst en de juiste ingrediënten.'

useSeoMeta({ title: titel, description: omschrijving, ogTitle: titel, ogDescription: omschrijving })
defineOgImage('Standaard', { title: titel, description: omschrijving })

useSchemaOrg([
  defineBreadcrumb({ itemListElement: [{ name: 'Home', item: '/' }, { name: 'Recepten' }] })
])
</script>

<template>
  <UContainer class="py-8 lg:py-12">
    <header class="mx-auto max-w-2xl text-center">
      <h1 class="text-3xl sm:text-4xl">
        {{ titel }}
      </h1>
      <p class="mt-4 text-muted">
        {{ omschrijving }}
      </p>
    </header>

    <div class="mt-8 flex flex-wrap justify-center gap-2">
      <UButton
        v-for="gang in gangen"
        :key="gang.value"
        :label="gang.label"
        :color="gekozen === gang.value ? 'primary' : 'neutral'"
        :variant="gekozen === gang.value ? 'solid' : 'outline'"
        size="sm"
        @click="gekozen = gang.value"
      />
    </div>

    <div
      v-if="zichtbaar.length"
      class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      <ReceptKaart
        v-for="(recept, i) in zichtbaar"
        :key="recept.path"
        :recept="recept"
        :prioriteit="i < 3"
      />
    </div>

    <p
      v-else
      class="mt-16 text-center text-muted"
    >
      Nog geen recepten in deze categorie.
    </p>
  </UContainer>
</template>
