<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  eyebrow?: string
  eyebrowTone?: 'butter' | 'ceramic' | 'white' | 'vermilion'
  lead?: string
  id?: string
  as?: 'h1' | 'h2' | 'h3'
  size?: 'sm' | 'md' | 'lg'
  center?: boolean
  leadClass?: string
}>(), {
  eyebrow: undefined,
  eyebrowTone: 'butter',
  lead: undefined,
  id: undefined,
  as: 'h2',
  size: 'md',
  center: false,
  leadClass: 'text-muted'
})

const slots = useSlots()

const SIZES = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-3xl sm:text-4xl'
}

const LEAD_SPACING = {
  sm: 'mt-2',
  md: 'mt-2',
  lg: 'mt-4'
}
</script>

<template>
  <!-- A row only when there is something beside the heading. -->
  <div :class="slots.actions ? 'flex flex-wrap items-end justify-between gap-4' : ''">
    <div :class="center ? 'text-center' : ''">
      <p v-if="eyebrow">
        <PillBadge :tone="eyebrowTone">
          {{ eyebrow }}
        </PillBadge>
      </p>

      <component
        :is="as"
        :id="id"
        :class="[SIZES[size], eyebrow ? 'mt-2' : '']"
      >
        {{ title }}
      </component>

      <p
        v-if="lead"
        :class="[leadClass, LEAD_SPACING[size], center ? 'mx-auto max-w-xl' : '']"
      >
        {{ lead }}
      </p>
      <slot name="lead" />
    </div>

    <slot name="actions" />
  </div>
</template>
