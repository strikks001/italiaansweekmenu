<script setup lang="ts">
// UApp levert de globale context voor toasts, tooltips en modals van Nuxt UI.
// NuxtLayout kiest de layout, NuxtPage rendert de huidige route.
const site = useSiteConfig()

// Site-wide, not just the homepage: recipes reference this as their author,
// and such a reference has to resolve on the same page.
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
