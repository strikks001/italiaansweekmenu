<script setup lang="ts">
const jaar = new Date().getFullYear()
</script>

<template>
  <!--
    De voettekst sluit de pagina af zoals de banier hem opent, maar in de
    tweede kleur en met de schulprand naar boven happend. Die hapt in de
    paginakleur, dus het vlak erboven moet licht blijven. Op keramiekblauw mag
    wit wel: dat haalt 11,94 tegen 3,57 op vermiljoen.
  -->
  <UFooter :ui="{ root: 'schulp-boven print-hide bg-keramiek-500 pt-10 text-white' }">
    <template #top>
      <UContainer class="grid gap-8 py-10 sm:grid-cols-3">
        <div>
          <p class="font-display text-xl font-extrabold tracking-tight text-white">
            Italiaansweekmenu
          </p>
          <p class="mt-2 text-sm">
            Elke week een compleet Italiaans menu met authentieke recepten,
            boodschappenlijst en de juiste ingrediënten.
          </p>
        </div>

        <nav aria-label="Site">
          <p class="font-display text-xs font-bold uppercase tracking-widest">
            Ontdekken
          </p>
          <ul class="mt-3 space-y-1.5 text-sm">
            <li>
              <NuxtLink
                to="/weekmenu"
                class="underline decoration-white/40 underline-offset-4 transition hover:decoration-white"
              >Alle weekmenu's</NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/recepten"
                class="underline decoration-white/40 underline-offset-4 transition hover:decoration-white"
              >Alle recepten</NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/over"
                class="underline decoration-white/40 underline-offset-4 transition hover:decoration-white"
              >Over dit project</NuxtLink>
            </li>
          </ul>
        </nav>

        <div>
          <p class="font-display text-xs font-bold uppercase tracking-widest">
            Ingrediënten bestellen
          </p>
          <p class="mt-3 text-sm">
            De Italiaanse producten uit onze recepten vind je bij Spesa da Antonio.
          </p>
          <UButton
            to="https://www.spesadaantonio.nl"
            target="_blank"
            rel="noopener"
            color="neutral"
            variant="solid"
            size="sm"
            class="mt-3 bg-white text-keramiek-700 hover:bg-boter-200"
            trailing-icon="i-lucide-arrow-up-right"
          >
            spesadaantonio.nl
          </UButton>
        </div>
      </UContainer>
    </template>

    <template #left>
      <p class="text-sm">
        © {{ jaar }} Italiaansweekmenu
      </p>
    </template>
  </UFooter>
</template>
