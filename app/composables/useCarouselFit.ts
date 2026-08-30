import type { MaybeRefOrGetter } from 'vue'

/**
 * Embla may stop scrolling once every card is visible, but not one breakpoint
 * earlier: a viewport showing fewer cards than there are leaves the last one
 * unreachable. Pass the width at which `perView` cards fit side by side.
 */
export function useCarouselFit(
  count: MaybeRefOrGetter<number>,
  perView: number,
  minWidth: number
) {
  const fits = computed(() => toValue(count) <= perView)

  const breakpoints = computed(() => ({
    [`(min-width: ${minWidth}px)`]: { active: !fits.value }
  }))

  return { fits, breakpoints }
}
