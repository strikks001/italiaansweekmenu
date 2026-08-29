<script setup lang="ts">
const jaar = new Date().getFullYear()
</script>

<template>
  <UFooter :ui="{ root: 'border-t border-default mt-16' }">
    <template #top>
      <UContainer class="grid gap-8 py-10 sm:grid-cols-3">
        <div>
          <p class="text-base font-semibold">
            Italiaansweekmenu
          </p>
          <p class="mt-2 text-sm text-muted">
            Elke week een compleet Italiaans menu met authentieke recepten,
            boodschappenlijst en de juiste ingrediënten.
          </p>
        </div>

        <nav aria-label="Site">
          <p class="text-sm font-semibold">
            Ontdekken
          </p>
          <ul class="mt-2 space-y-1 text-sm text-muted">
            <li>
              <NuxtLink
                to="/weekmenu"
                class="hover:text-primary"
              >Alle weekmenu's</NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/recepten"
                class="hover:text-primary"
              >Alle recepten</NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/over"
                class="hover:text-primary"
              >Over dit project</NuxtLink>
            </li>
          </ul>
        </nav>

        <div>
          <p class="text-sm font-semibold">
            Ingrediënten bestellen
          </p>
          <p class="mt-2 text-sm text-muted">
            De Italiaanse producten uit onze recepten vind je bij Spesa da Antonio.
          </p>
          <UButton
            to="https://www.spesadaantonio.nl"
            target="_blank"
            rel="noopener"
            color="secondary"
            variant="subtle"
            size="sm"
            class="mt-3"
            trailing-icon="i-lucide-arrow-up-right"
          >
            spesadaantonio.nl
          </UButton>
        </div>
      </UContainer>
    </template>

    <template #left>
      <p class="text-sm text-muted">
        © {{ jaar }} Italiaansweekmenu
      </p>
    </template>
  </UFooter>
</template>
