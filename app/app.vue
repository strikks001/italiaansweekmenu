<script setup lang="ts">
// UApp levert de globale context voor toasts, tooltips en modals van Nuxt UI.
// NuxtLayout kiest de layout, NuxtPage rendert de huidige route.
const site = useSiteConfig()

// Site-breed, niet alleen op de homepage: recepten verwijzen hiernaar als
// auteur en uitgever, en zo'n verwijzing moet op dezelfde pagina staan.
useSchemaOrg([
  defineWebSite({ name: site.name, description: site.description, inLanguage: 'nl-NL' }),
  defineOrganization({ name: site.name, url: site.url })
])

useHead({
  link: [{ rel: 'alternate', type: 'application/rss+xml', title: site.name, href: '/feed.xml' }]
})
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator color="var(--ui-primary)" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
