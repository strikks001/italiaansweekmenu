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
  <div>
    <PageBanner>
      <h1 class="text-4xl text-white sm:text-5xl">
        {{ page.title }}
      </h1>
      <p class="mt-4 text-lg">
        {{ page.description }}
      </p>
    </PageBanner>

    <UContainer class="py-10 lg:py-14">
      <article class="prose dark:prose-invert mx-auto max-w-4xl">
        <ContentRenderer :value="page" />
      </article>
    </UContainer>
  </div>
</template>
