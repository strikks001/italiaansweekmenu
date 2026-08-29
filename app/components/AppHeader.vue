<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const items: NavigationMenuItem[] = [
  { label: 'Weekmenu', to: '/weekmenu', icon: 'i-lucide-calendar-days' },
  { label: 'Recepten', to: '/recepten', icon: 'i-lucide-utensils-crossed' },
  { label: 'Over', to: '/over', icon: 'i-lucide-info' }
]
</script>

<template>
  <UHeader :ui="{ root: 'print-hide border-b border-default bg-default/80 backdrop-blur' }">
    <template #title>
      <NuxtLink
        to="/"
        class="text-lg font-bold"
      >
        Italiaans<span class="text-primary">weekmenu</span>
      </NuxtLink>
    </template>

    <UNavigationMenu :items="items" />

    <template #right>
      <UColorModeButton />
      <UButton
        to="https://www.spesadaantonio.nl"
        target="_blank"
        rel="noopener"
        color="secondary"
        icon="i-lucide-shopping-basket"
        class="hidden sm:inline-flex"
      >
        Naar de winkel
      </UButton>
    </template>

    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
      />
    </template>
  </UHeader>
</template>
