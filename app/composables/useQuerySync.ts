import type { LocationQueryRaw } from 'vue-router'

/**
 * Keeps filter state in the URL so a filtered list can be shared.
 *
 * A statically generated page hydrates with the server's route, whose query is
 * empty. Reading during setup would miss the filters and the first write would
 * strip them from the URL. So we apply them once mounted, and only start
 * writing after that.
 */
export function useQuerySync(
  apply: (query: Record<string, string>) => void,
  build: () => LocationQueryRaw
) {
  const route = useRoute()
  const router = useRouter()
  const ready = ref(false)

  onMounted(() => {
    apply(Object.fromEntries(
      Object.entries(route.query).map(([k, v]) => [k, String(v ?? '')])
    ))
    ready.value = true
  })

  watchEffect(() => {
    if (ready.value) router.replace({ query: build() })
  })

  return ready
}
