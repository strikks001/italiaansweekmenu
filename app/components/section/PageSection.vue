<script setup lang="ts">
// Imported, not named as a string in `:is`: a string only resolves when
// something else on the page already pulled UContainer into the bundle, so
// /over silently lost its container.
import { UContainer } from '#components'

withDefaults(defineProps<{
  title?: string
  eyebrow?: string
  eyebrowTone?: 'butter' | 'ceramic' | 'white' | 'vermilion'
  lead?: string
  headingSize?: 'sm' | 'md' | 'lg'
  /** Background band. Omit on a section that sits on the page colour. */
  tone?: 'butter' | 'ceramic'
  /** Own container, or a block inside one the page already opened. */
  contained?: boolean
  spacing?: 'page' | 'band' | 'compact' | 'none'
  width?: 'prose' | 'wide'
  center?: boolean
  leadClass?: string
}>(), {
  title: undefined,
  eyebrow: undefined,
  eyebrowTone: 'butter',
  lead: undefined,
  headingSize: 'md',
  tone: undefined,
  contained: true,
  spacing: 'page',
  width: 'wide',
  center: false,
  leadClass: undefined
})

const slots = useSlots()

// Labelled by its own heading, so screen readers can list the sections.
const headingId = useId()

const TONES = {
  butter: 'bg-butter-100 dark:bg-butter-950',
  ceramic: 'bg-ceramic-500 text-white'
}

const SPACING = {
  page: 'py-10 lg:py-14',
  compact: 'py-12 lg:py-16',
  band: 'py-14 lg:py-20',
  none: ''
}
</script>

<template>
  <section
    :aria-labelledby="title ? headingId : undefined"
    :class="tone ? TONES[tone] : ''"
  >
    <component
      :is="contained ? UContainer : 'div'"
      :class="contained ? SPACING[spacing] : ''"
    >
      <div
        class="mx-auto"
        :class="[width === 'prose' ? 'max-w-2xl' : 'max-w-4xl', center ? 'text-center' : '']"
      >
        <SectionHeading
          v-if="title"
          :id="headingId"
          :title="title"
          :eyebrow="eyebrow"
          :eyebrow-tone="eyebrowTone"
          :lead="lead"
          :size="headingSize"
          :center="center"
          :lead-class="leadClass"
        >
          <!-- Forwarded only when the page actually passes actions: an empty
               template would still turn the heading into a two-column row. -->
          <template
            v-if="slots.actions"
            #actions
          >
            <slot name="actions" />
          </template>
        </SectionHeading>

        <div :class="title ? 'mt-6' : ''">
          <slot />
        </div>
      </div>
    </component>
  </section>
</template>
