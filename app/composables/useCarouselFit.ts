import type { MaybeRefOrGetter } from 'vue'

/**
 * Embla may stop scrolling once every card is visible, but not one breakpoint
 * earlier: a viewport showing fewer cards than there are leaves the last one
 * unreachable. Pass the width at which `perView` cards fit side by side.
 *
 * Also returns the shared `ui` config, so every carousel on the site keeps the
 * same 2rem gap as the card grids.
 */
export function useCarouselFit(
  count: MaybeRefOrGetter<number>,
  perView: number,
  minWidth: number,
  basis = 'basis-[86%] sm:basis-1/2 lg:basis-1/3'
) {
  const fits = computed(() => toValue(count) <= perView)

  const breakpoints = computed(() => ({
    [`(min-width: ${minWidth}px)`]: { active: !fits.value }
  }))

  const hidden = minWidth <= 640 ? 'sm:hidden' : 'lg:hidden'

  const ui = computed(() => ({
    // Padding gives the hover shadow room inside the overflow-hidden clip.
    viewport: '-m-4 p-4',
    container: '-ms-8 items-stretch',
    item: `ps-8 ${basis}`,
    prev: fits.value ? hidden : '',
    next: fits.value ? hidden : ''
  }))

  return { fits, breakpoints, ui }
}
