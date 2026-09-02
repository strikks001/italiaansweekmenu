<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const items: NavigationMenuItem[] = [
  { label: 'Weekmenu', to: '/weekmenu', icon: 'i-lucide-calendar-days' },
  { label: 'Recepten', to: '/recepten', icon: 'i-lucide-utensils-crossed' },
  { label: 'Over', to: '/over', icon: 'i-lucide-info' },
  { label: 'Contact', to: '/contact', icon: 'i-lucide-mail' }
]

// UHeader's own menu is a fullscreen modal with no footer; the filters use a
// SideSheet. One pattern for both, so its toggle is ours to drive.
const open = ref(false)
const route = useRoute()

watch(() => route.fullPath, () => {
  open.value = false
})
</script>

<template>
  <UHeader
    :toggle="false"
    :ui="{ root: 'print-hide border-b-2 border-default bg-default/90 backdrop-blur' }"
  >
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
      <SearchDialog />
      <UColorModeButton />
      <UButton
        icon="i-lucide-menu"
        color="neutral"
        variant="ghost"
        size="lg"
        aria-label="Menu openen"
        :aria-expanded="open"
        class="lg:hidden"
        @click="open = true"
      />
    </template>
  </UHeader>

  <SideSheet
    v-model:open="open"
    title="Menu"
  >
    <UNavigationMenu
      :items="items"
      orientation="vertical"
    />
  </SideSheet>
</template>
