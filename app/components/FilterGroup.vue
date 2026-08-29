<script setup lang="ts">
export interface FilterOption {
  value: string
  label: string
}

const props = defineProps<{
  title: string
  options: FilterOption[]
  counts?: Record<string, number>
  /** true = multi select (diet), false = single choice (course). */
  multiple?: boolean
}>()

const selected = defineModel<string | string[]>({ required: true })

function isActive(value: string): boolean {
  return props.multiple
    ? (selected.value as string[]).includes(value)
    : selected.value === value
}

/**
 * Every row carries an indicator of the same width, so the groups line up:
 * a circle for a single choice, a square where several can be on at once.
 */
function indicator(value: string): string {
  if (props.multiple) {
    return isActive(value) ? 'i-lucide-square-check-big' : 'i-lucide-square'
  }
  return isActive(value) ? 'i-lucide-circle-check' : 'i-lucide-circle'
}

function choose(value: string) {
  if (props.multiple) {
    const current = selected.value as string[]
    selected.value = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
  } else {
    selected.value = value
  }
}
</script>

<template>
  <UCollapsible default-open>
    <template #default="{ open }">
      <UButton
        color="neutral"
        variant="ghost"
        block
        class="justify-between px-2"
      >
        <span class="text-xs font-semibold uppercase tracking-wider text-muted">{{ title }}</span>
        <UIcon
          name="i-lucide-chevron-down"
          class="size-4 transition-transform duration-200"
          :class="open ? 'rotate-180' : ''"
        />
      </UButton>
    </template>

    <template #content>
      <nav
        class="mt-1 flex flex-col gap-0.5"
        :aria-label="`Filter op ${title.toLowerCase()}`"
      >
        <UButton
          v-for="option in options"
          :key="option.value"
          :color="isActive(option.value) ? 'primary' : 'neutral'"
          :variant="isActive(option.value) ? 'solid' : 'ghost'"
          :icon="indicator(option.value)"
          size="sm"
          class="w-full"
          :aria-pressed="isActive(option.value)"
          @click="choose(option.value)"
        >
          <!-- flex-1 pushes the count right and keeps the label left. -->
          <span class="flex-1 text-left">{{ option.label }}</span>
          <span class="text-xs tabular-nums opacity-60">{{ counts?.[option.value] ?? 0 }}</span>
        </UButton>
      </nav>
    </template>
  </UCollapsible>
</template>
