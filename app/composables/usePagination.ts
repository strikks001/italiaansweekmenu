import type { Ref } from 'vue'

/**
 * Renders one page of cards at a time, so a growing archive does not keep
 * adding images and nodes. Pages own their query sync and add `pagina` there.
 */
export function usePagination<T>(items: Ref<T[]>, perPage: number) {
  const route = useRoute()

  const page = ref(Math.max(1, Number(route.query.pagina) || 1))

  const pageCount = computed(() => Math.max(1, Math.ceil(items.value.length / perPage)))

  const paged = computed(() =>
    items.value.slice((page.value - 1) * perPage, page.value * perPage)
  )

  // Filtering can leave you on a page that no longer exists.
  watch(pageCount, (count) => {
    if (page.value > count) page.value = 1
  })

  return { page, pageCount, paged, perPage }
}
