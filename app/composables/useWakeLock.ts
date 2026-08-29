/**
 * Keeps the screen awake while cooking. Not supported everywhere, so the
 * caller should only show a toggle when `supported` is true.
 */
export function useWakeLock() {
  const supported = ref(false)
  const active = ref(false)
  let sentinel: WakeLockSentinel | null = null

  onMounted(() => {
    supported.value = 'wakeLock' in navigator
  })

  async function enable() {
    try {
      sentinel = await navigator.wakeLock.request('screen')
      sentinel.addEventListener('release', () => {
        active.value = false
      })
      active.value = true
    } catch {
      active.value = false
    }
  }

  function disable() {
    sentinel?.release()
    sentinel = null
    active.value = false
  }

  // Browsers drop the lock when the tab is hidden; take it back on return.
  function onVisibility() {
    if (active.value && document.visibilityState === 'visible' && !sentinel) enable()
  }

  onMounted(() => document.addEventListener('visibilitychange', onVisibility))
  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', onVisibility)
    disable()
  })

  return { supported, active, toggle: () => (active.value ? disable() : enable()) }
}
