<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  /** Rendered as a pill above the title. */
  eyebrow?: string
  eyebrowTone?: 'butter' | 'ceramic' | 'white' | 'vermilion'
  lead?: string
  /** Links the surrounding section to this heading. */
  id?: string
  as?: 'h1' | 'h2' | 'h3'
  size?: 'sm' | 'md' | 'lg'
  center?: boolean
  /** Text colour for the lead; the default reads on the page background. */
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

// A bigger heading carries more air beneath it.
const LEAD_SPACING = {
  sm: 'mt-2',
  md: 'mt-2',
  lg: 'mt-4'
}
</script>

<template>
  <!-- The row only becomes a row when there is something to put beside the
       heading; otherwise justify-between pulls a centred block apart. -->
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
