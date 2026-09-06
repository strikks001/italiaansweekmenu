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
    <!-- UHeader wraps this slot in its own link to "/". A NuxtLink here would
         nest <a> in <a>; the browser splits that, and hydration fails. -->
    <template #title>
      <span class="flex items-center gap-2 text-xl font-bold">
        <BrandMark class="size-7 shrink-0" />
        <span><span class="text-secondary dark:text-ceramic-300">Italiaans</span><span class="text-primary">weekmenu</span></span>
      </span>
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
