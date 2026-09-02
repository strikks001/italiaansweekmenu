<script setup lang="ts">
defineProps<{ title: string }>()

const open = defineModel<boolean>('open', { required: true })
</script>

<template>
  <!-- One shell for every panel that slides in from the left: the filters on
       the overviews and the navigation on mobile. -->
  <USlideover
    v-model:open="open"
    :title="title"
    side="left"
  >
    <template #body>
      <slot />
    </template>

    <template
      v-if="$slots.footer"
      #footer
    >
      <div class="flex w-full gap-2">
        <slot name="footer" />
      </div>
    </template>
  </USlideover>
</template>
