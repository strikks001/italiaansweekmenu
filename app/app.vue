<script setup lang="ts">
// UApp levert de globale context voor toasts, tooltips en modals van Nuxt UI.
// NuxtLayout kiest de layout, NuxtPage rendert de huidige route.
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator color="var(--ui-primary)" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
