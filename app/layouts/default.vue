<script setup lang="ts">
const route = useRoute()
const site = useSiteConfig()
const pageUrl = computed(() => new URL(route.path, site.url).toString())
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />
    <UMain class="flex-1">
      <slot />
    </UMain>
    <AppFooter />

    <!-- Paper has no back button. -->
    <div class="print-foot hidden">
      <b>Italiaans<span>weekmenu</span></b>
      <span>{{ pageUrl }}</span>
    </div>
  </div>
</template>
