export type ViewMode = 'cards' | 'list'

const STORAGE_KEY = 'iwm:view-mode'

/**
 * Card or list view. Deliberately not in the URL: a preference, not content,
 * and it would create a second URL with the same items.
 */
export function useViewMode() {
  const mode = useState<ViewMode>('view-mode', () => 'cards')

  onMounted(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'list' || stored === 'cards') mode.value = stored
    } catch {
      // Private mode or blocked storage.
    }
  })

  watch(mode, (next) => {
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Storing must not break the page.
    }
  })

  return mode
}
