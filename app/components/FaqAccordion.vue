<script setup lang="ts">
const props = withDefaults(defineProps<{
  items: { vraag: string, antwoord: string }[]
  title?: string
}>(), { title: 'Veelgestelde vragen' })

const headingId = useId()

const entries = computed(() =>
  props.items.map(item => ({ label: item.vraag, content: item.antwoord }))
)
</script>

<template>
  <section
    v-if="items.length"
    :aria-labelledby="headingId"
  >
    <h2
      :id="headingId"
      class="text-xl"
    >
      {{ title }}
    </h2>

    <!-- unmount-on-hide off: a closed answer must still be in the generated
         HTML, or the text disappears from the page for search engines. -->
    <UAccordion
      :items="entries"
      :unmount-on-hide="false"
      :ui="{
        root: 'mt-4 overflow-hidden rounded-2xl border border-default border-b-4 border-b-ceramic-500',
        item: 'px-4 sm:px-5',
        trigger: 'text-base font-semibold',
        body: 'pb-4 text-base'
      }"
    >
      <template #body="{ item }">
        <!-- The Prose components style themselves, so no prose wrapper is
             needed; only their outer margins have to go, or the answer drifts
             away from its own question. MDC nests, hence the descendant. -->
        <div class="[&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
          <MDC :value="item.content" />
        </div>
      </template>
    </UAccordion>
  </section>
</template>
