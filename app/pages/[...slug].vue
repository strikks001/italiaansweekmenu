<script setup lang="ts">
// Vangnet-route voor losse pagina's uit de 'paginas'-collectie,
// zoals /over, /privacy of /contact.
const route = useRoute()

const { data } = await useAsyncData(`pagina:${route.path}`, () =>
  queryCollection('paginas').path(route.path).first()
)

if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Pagina niet gevonden', fatal: true })
}

// Na de throw weet TypeScript dat data.value bestaat; door hem hier vast te
// leggen werkt het sjabloon met een gegarandeerd niet-lege waarde.
const pagina = data.value

useSeoMeta({
  title: pagina.seo?.title || pagina.title,
  description: pagina.seo?.description || pagina.description
})
defineOgImage('Standaard', {
  title: pagina.title,
  description: pagina.description
})
</script>

<template>
  <UContainer class="py-8 lg:py-12">
    <article class="prose dark:prose-invert mx-auto max-w-3xl">
      <h1>{{ pagina.title }}</h1>
      <p class="lead">
        {{ pagina.description }}
      </p>
      <ContentRenderer :value="pagina" />
    </article>
  </UContainer>
</template>
