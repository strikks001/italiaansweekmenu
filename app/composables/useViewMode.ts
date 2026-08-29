export type ViewMode = 'cards' | 'list'

const STORAGE_KEY = 'iwm:view-mode'

/**
 * Card or list view, shared by every overview page.
 *
 * Deliberately not in the URL: it is a personal preference, not content, and
 * ?weergave=lijst would create a second URL with the same items. useState
 * shares it between pages, localStorage across visits. Reading happens after
 * hydration because localStorage does not exist during prerender.
 */
export function useViewMode() {
  const mode = useState<ViewMode>('view-mode', () => 'cards')

  onMounted(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'list' || stored === 'cards') mode.value = stored
    } catch {
      // Private mode or blocked storage: fall back to the default.
    }
  })

  watch(mode, (next) => {
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Failing to store must not break the page.
    }
  })

  return mode
}
