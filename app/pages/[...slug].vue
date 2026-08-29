<script setup lang="ts">
// Catch-all for standalone pages from the 'paginas' collection, e.g. /over.
const route = useRoute()

const { data } = await useAsyncData(`page:${route.path}`, () =>
  queryCollection('paginas').path(route.path).first()
)

if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Pagina niet gevonden', fatal: true })
}

const page = data.value

useSeoMeta({
  title: page.seo?.title || page.title,
  description: page.seo?.description || page.description
})
defineOgImage('Default', {
  title: page.title,
  description: page.description
})
</script>

<template>
  <UContainer class="py-8 lg:py-12">
    <article class="prose dark:prose-invert mx-auto max-w-3xl">
      <h1>{{ page.title }}</h1>
      <p class="lead">
        {{ page.description }}
      </p>
      <ContentRenderer :value="page" />
    </article>
  </UContainer>
</template>
